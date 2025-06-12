package main

import (
	"encoding/gob"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/alexedwards/scs/v2"
	"github.com/bijay11/bookings/internal/config"
	"github.com/bijay11/bookings/internal/driver"
	"github.com/bijay11/bookings/internal/handlers"
	"github.com/bijay11/bookings/internal/helpers"
	"github.com/bijay11/bookings/internal/models"
	"github.com/bijay11/bookings/internal/render"
)

const portNumber = ":8080"

var app config.AppConfig
var session *scs.SessionManager
var infoLog *log.Logger
var errorLog *log.Logger

func main() {

	db, err := run()

	defer db.SQL.Close()

	defer close(app.Mailchan)

	fmt.Println("Starting mail listener...")

	listenForMail()

	if err != nil {
		log.Fatal("cannot start application", err)
	}

	fmt.Printf("Starting application on port %s\n", portNumber)

	serve := &http.Server{
		Addr:    portNumber,
		Handler: routes(&app),
	}
	err = serve.ListenAndServe()
	log.Fatal(err)
}

func run() (*driver.DB, error) {

	// These will be registered in the session
	gob.Register(models.Reservation{})
	gob.Register(models.User{})
	gob.Register(models.Room{})
	gob.Register(models.Restriction{})
	gob.Register(map[string]int{})

	// Read environment variables
	inProduction := flag.Bool("production", true, "Run in production mode")
	useCache := flag.Bool("cache", true, "Use template cache")
	dbHost := flag.String("dbhost", "localhost", "Database host")
	dbName := flag.String("dbname", "", "Database name")
	dbUser := flag.String("dbuser", "", "Database user")
	dbPass := flag.String("dbpass", "", "Database password")
	dbPort := flag.String("dbport", "5432", "Database port")
	dbSSL := flag.String("dbssl", "", "Database ssl settings (disable, prefer, require)")

	flag.Parse()

	if *dbName == "" || *dbUser == "" {
		fmt.Println("Database name and user must be provided")
		os.Exit(1)
	}

	mailChan := make(chan models.MailData)

	app.Mailchan = mailChan

	app.InProduction = *inProduction
	app.UseCache = *useCache

	infoLog = log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
	app.InfoLog = infoLog

	errorLog = log.New(os.Stdout, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)
	app.ErrorLog = errorLog

	session = scs.New()
	session.Lifetime = 24 * time.Hour
	session.Cookie.Persist = true
	session.Cookie.SameSite = http.SameSiteLaxMode
	session.Cookie.Secure = app.InProduction

	app.Session = session

	// connnect to database
	log.Println("Connecting to the database")

	connectionString := fmt.Sprintf("host=%s port=%s dbname=%s user=%s password=%s sslmode=%s", *dbHost, *dbPort, *dbName, *dbUser, *dbPass, *dbSSL)
	db, err := driver.ConnectSQL(connectionString)
	if err != nil {
		log.Fatal("cannot connect to database", err)
		return nil, err
	}

	log.Println("Connected to database")

	templateCache, err := render.CreateTemplateCache()

	if err != nil {
		log.Fatal("cannot create template cache")
		return nil, err
	}

	app.TemplateCache = templateCache

	repo := handlers.NewRepo(&app, db)
	handlers.NewHandlers(repo)
	render.NewRenderer(&app)
	helpers.NewHelpers(&app)

	return db, nil
}
