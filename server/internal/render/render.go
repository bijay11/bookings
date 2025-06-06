package render

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
	"time"

	"github.com/bijay11/bookings/internal/config"
	"github.com/bijay11/bookings/internal/models"
	"github.com/justinas/nosurf"
)

func AddDefaultData(td *models.TemplateData, r *http.Request) *models.TemplateData {
	td.Flash = app.Session.PopString(r.Context(), "flash")
	td.Warning = app.Session.PopString(r.Context(), "warning")
	td.Error = app.Session.PopString(r.Context(), "error")

	td.CSRFToken = nosurf.Token(r)

	if app.Session.Exists(r.Context(), "user_id") {
		// Default value for IsAuthenticated is 0
		td.IsAuthenticated = 1
	}
	return td
}

func Template(w http.ResponseWriter, r *http.Request, tmpl string, td *models.TemplateData) {
	var tc map[string]*template.Template
	if app.UseCache {

		tc = app.TemplateCache
	} else {
		tc, _ = CreateTemplateCache()
	}

	t, ok := tc[tmpl]

	if !ok {
		log.Fatal("Could not get template from template cache")
	}

	buf := new(bytes.Buffer)

	td = AddDefaultData(td, r)

	_ = t.Execute(buf, td)

	_, err := buf.WriteTo(w)

	if err != nil {
		fmt.Println("Error writing template to browser", err)
	}

}

var functions = template.FuncMap{
	"formatAsMMDDYYYY": FormatAsMMDDYYYY,
	"formatDate":       FormatDate,
	"iterate":          Iterate,
	"add":              Add,
}

var app *config.AppConfig

func Add(a, b int) int {
	return a + b
}

// Iterate returns a slice of integers from 0 to count.
func Iterate(count int) []int {
	var i int
	var items []int

	for i = 0; i < count; i++ {
		items = append(items, i)
	}
	return items
}

func NewRenderer(a *config.AppConfig) {
	app = a
}

// FormatAsMMDDYYYY formats a time.Time object to a string in MM/DD/YYYY format.
func FormatAsMMDDYYYY(t time.Time) string {
	return t.Format("01/02/2006") // MM/DD/YYYY
}

func FormatDate(t time.Time, f string) string {
	return t.Format(f) // Example format
}

func CreateTemplateCache() (map[string]*template.Template, error) {
	myCache := map[string]*template.Template{}

	pages, err := filepath.Glob("./templates/*.page.tmpl")

	if err != nil {
		return myCache, err
	}

	for _, page := range pages {
		name := filepath.Base(page)

		ts, err := template.New(name).Funcs(functions).ParseFiles(page)

		if err != nil {
			return myCache, err
		}

		matches, err := filepath.Glob("./templates/*.layout.tmpl")

		if err != nil {
			return myCache, err
		}

		if len(matches) > 0 {
			ts, err = ts.ParseGlob("./templates/*.layout.tmpl")

			if err != nil {
				return myCache, err
			}
		}

		myCache[name] = ts

	}

	return myCache, nil
}
