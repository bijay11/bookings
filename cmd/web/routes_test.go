package main

import (
	"testing"

	"github.com/bijay11/bookings/internal/config"
	"github.com/go-chi/chi/v5"
)

func TestRoutes(t *testing.T) {
	// Create a new AppConfig instance
	var app config.AppConfig

	mux := routes(&app)

	switch v := mux.(type) {
	case *chi.Mux:
		// ok
	default:
		t.Errorf("routes() does not return a chi.Mux, got %T", v)
	}
}
