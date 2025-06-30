package main

import (
	"net/http"

	"github.com/bijay11/bookings/internal/config"
	"github.com/bijay11/bookings/internal/handlers"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func routes(app *config.AppConfig) http.Handler {

	mux := chi.NewRouter()

	mux.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // allow your frontend origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum value not ignored by any of major browsers
	}))

	mux.Use(middleware.Recoverer)

	// Apply SessionLoad for all routes
	mux.Use(SessionLoad)

	// Non-API routes with CSRF protection
	mux.Group(func(r chi.Router) {
		r.Use(NoSurf)

		r.Get("/", handlers.Repo.Home)
		r.Get("/about", handlers.Repo.About)
		r.Get("/generals-quarters", handlers.Repo.Generals)
		r.Get("/majors-suite", handlers.Repo.Majors)

		r.Get("/search-availability", handlers.Repo.Availability)
		r.Post("/search-availability", handlers.Repo.PostAvailability)
		r.Post("/search-availability-json", handlers.Repo.AvailabilityJson)

		r.Get("/choose-room/{id}", handlers.Repo.ChooseRoom)

		// Note: should this be a POST?
		r.Get("/book-room", handlers.Repo.BookRoom)

		r.Get("/contact", handlers.Repo.Contact)

		r.Get("/make-reservation", handlers.Repo.Reservation)
		r.Post("/make-reservation", handlers.Repo.PostReservation)
		r.Get("/reservation-summary", handlers.Repo.ReservationSummary)

		r.Get("/user/login", handlers.Repo.ShowLogin)
		r.Post("/user/login", handlers.Repo.PostLogin)
		r.Get("/user/logout", handlers.Repo.Logout)

		r.Route("/admin", func(rAdmin chi.Router) {
			// rAdmin.Use(Auth)

			rAdmin.Get("/dashboard", handlers.Repo.AdminDashboard)
			rAdmin.Get("/reservations-new", handlers.Repo.AdminNewReservations)
			rAdmin.Get("/reservations-all", handlers.Repo.AdminAllReservations)
			rAdmin.Get("/reservations-calendar", handlers.Repo.AdminReservationsCalendar)
			rAdmin.Post("/reservations-calendar", handlers.Repo.AdminPostReservationsCalendar)

			rAdmin.Get("/process-reservation/{src}/{id}", handlers.Repo.AdminProcessReservation)
			rAdmin.Get("/delete-reservation/{src}/{id}", handlers.Repo.AdminDeleteReservation)

			rAdmin.Get("/reservations/{src}/{id}", handlers.Repo.AdminShowReservation)
			rAdmin.Post("/reservations/{src}/{id}", handlers.Repo.AdminPostShowReservation)
		})
	})

	// API routes without NoSurf (no CSRF)
	mux.Route("/api", func(r chi.Router) {
		r.Get("/listings/{id}/reviews", handlers.Repo.GetListingReviews)
		r.Get("/listings/{id}", handlers.Repo.GetListingDetails)
		r.Get("/listings", handlers.Repo.GetListings)
	})

	mux.Post("/ask-about-reviews", handlers.Repo.AskAboutReviews)

	// Serve static files
	fileServer := http.FileServer(http.Dir("./static/"))
	mux.Handle("/static/*", http.StripPrefix("/static", fileServer))

	return mux
}
