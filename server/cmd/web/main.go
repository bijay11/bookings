package main

import (
	"encoding/gob"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
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

func getEnv(key, defaultValue string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultValue
	}
	return val
}

func run() (*driver.DB, error) {

	// Register types for session storage
	gob.Register(models.Reservation{})
	gob.Register(models.User{})
	gob.Register(models.Room{})
	gob.Register(models.Restriction{})
	gob.Register(map[string]int{})

	// Read config from environment variables with defaults
	inProductionStr := getEnv("PRODUCTION", "true")
	useCacheStr := getEnv("CACHE", "true")
	dbHost := getEnv("DB_HOST", "localhost")
	dbName := getEnv("DB_NAME", "")
	dbUser := getEnv("DB_USER", "")
	dbPass := getEnv("DB_PASS", "")
	dbPort := getEnv("DB_PORT", "5432")
	dbSSL := getEnv("DB_SSL", "disable")

	// Parse booleans
	inProduction, err := strconv.ParseBool(inProductionStr)
	if err != nil {
		log.Printf("Invalid PRODUCTION value, defaulting to true")
		inProduction = true
	}
	useCache, err := strconv.ParseBool(useCacheStr)
	if err != nil {
		log.Printf("Invalid CACHE value, defaulting to true")
		useCache = true
	}

	if dbName == "" || dbUser == "" {
		log.Fatal("Database name and user must be provided")
		os.Exit(1)
	}

	mailChan := make(chan models.MailData)
	app.Mailchan = mailChan

	app.InProduction = inProduction
	app.UseCache = useCache

	infoLog := log.New(os.Stdout, "INFO\t", log.Ldate|log.Ltime)
	app.InfoLog = infoLog

	errorLog := log.New(os.Stdout, "ERROR\t", log.Ldate|log.Ltime|log.Lshortfile)
	app.ErrorLog = errorLog

	session = scs.New()
	session.Lifetime = 24 * time.Hour
	session.Cookie.Persist = true
	session.Cookie.SameSite = http.SameSiteLaxMode
	session.Cookie.Secure = app.InProduction

	app.Session = session

	// Connect to database
	log.Println("Connecting to the database")
	connectionString := fmt.Sprintf("host=%s port=%s dbname=%s user=%s password=%s sslmode=%s",
		dbHost, dbPort, dbName, dbUser, dbPass, dbSSL)

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
