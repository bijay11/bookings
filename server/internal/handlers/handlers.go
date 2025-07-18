package handlers

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/bijay11/bookings/internal/config"
	"github.com/bijay11/bookings/internal/driver"
	"github.com/bijay11/bookings/internal/forms"
	"github.com/bijay11/bookings/internal/helpers"
	"github.com/bijay11/bookings/internal/models"
	"github.com/bijay11/bookings/internal/render"
	"github.com/bijay11/bookings/internal/repository"
	"github.com/bijay11/bookings/internal/repository/dbrepo"
	"github.com/go-chi/chi/v5"
)

// repository used by the handlers
var Repo *Repository

// Repository type
type Repository struct {
	App *config.AppConfig
	DB  repository.DatabaseRepo
}

type Response struct {
	Message string `json:"message"`
	User    string `json:"user"`
}

type jsonResponse struct {
	OK        bool   `json:"ok"`
	Message   string `json:"message"`
	RoomID    string `json:"room_id"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
}

type Location struct {
	City    string `json:"city"`
	State   string `json:"state"`
	ZipCode string `json:"zip_code,omitempty"` // optional
}

type Pricing struct {
	PricePerNight float64 `json:"price_per_night"`
	// Could be extended with discounts, cleaning_fee, currency, etc.
}

type ReviewSummary struct {
	AverageRating float64 `json:"average_rating"`
	TotalReviews  int     `json:"total_reviews"`
}

type Listing struct {
	ID            int           `json:"id"`
	Title         string        `json:"title"`
	City          string        `json:"city"`
	State         string        `json:"state"`
	ImageURL      string        `json:"image_url"`
	PricePerNight float64       `json:"price_per_night"`
	ReviewSummary ReviewSummary `json:"review_summary"`
}

type ListingsResponse struct {
	Data []Listing `json:"data"`
}

type Host struct {
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url"`
}

type ListingDetails struct {
	ID          int           `json:"id"`
	Title       string        `json:"title"`
	Location    Location      `json:"location"`
	Pricing     Pricing       `json:"pricing"`
	Description string        `json:"description"`
	Images      []string      `json:"images"`
	Amenities   []string      `json:"amenities"`
	Host        Host          `json:"host"`
	Review      ReviewSummary `json:"review_summary"`
}

type ListingDetailsResponse struct {
	Data ListingDetails `json:"data"`
}

type Review struct {
	ReviewerID string `json:"reviewer_id"`
	Reviewer   string `json:"reviewer"`
	Comment    string `json:"comment"`
	Rating     int    `json:"rating"`
	Date       string `json:"date"`
	AvatarURL  string `json:"avatar_url"`
	TripType   string `json:"trip_type"`
	Location   string `json:"location"`
}

// ReviewResponse is the API response for listing reviews
type ReviewResponse struct {
	ListingID     int      `json:"listing_id"`
	AverageRating float64  `json:"average_rating"`
	TotalReviews  int      `json:"total_reviews"`
	Reviews       []Review `json:"reviews"`
}

// Request payload struct
type AskPayload struct {
	ListingID string `json:"listing_id"`
	Question  string `json:"question"`
}

type AskRequestToLLM struct {
	ListingID string `json:"listing_id"`
	Question  string `json:"question"`
	Content   string `json:"content"`
}

// Creates a new repository
func NewRepo(a *config.AppConfig, db *driver.DB) *Repository {
	return &Repository{
		App: a,
		DB:  dbrepo.NewPostgresRepo(db.SQL, a),
	}
}

// sets the repository for the handlers
func NewHandlers(r *Repository) {
	Repo = r
}

func (m *Repository) Home(w http.ResponseWriter, r *http.Request) {
	response := Response{
		Message: "Hello from the home page",
		User:    "Guest",
	}
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		m.App.ErrorLog.Println("Error encoding JSON response:", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	// render.Template(w, r, "home.page.tmpl", &models.TemplateData{})
}

func (m *Repository) About(w http.ResponseWriter, r *http.Request) {
	// send data to template
	render.Template(w, r, "about.page.tmpl", &models.TemplateData{})
}

// renders the make a reservation page and displays form
func (m *Repository) Reservation(w http.ResponseWriter, r *http.Request) {

	res, ok := m.App.Session.Get(r.Context(), "reservation").(models.Reservation)
	if !ok {
		helpers.ServerError(w, errors.New("cannot get reservation from session"))
		return
	}

	room, err := m.DB.GetRoomByID(res.RoomID)
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	res.Room.Name = room.Name

	m.App.Session.Put(r.Context(), "reservation", res)

	startDate := res.StartDate.Format("2006-01-02")
	endDate := res.EndDate.Format("2006-01-02")

	stringMap := make(map[string]string)
	stringMap["start_date"] = startDate
	stringMap["end_date"] = endDate

	data := make(map[string]any)
	data["reservation"] = res

	render.Template(w, r, "make-reservation.page.tmpl", &models.TemplateData{
		Form:      forms.New(nil),
		Data:      data,
		StringMap: stringMap,
	})
}

// PostReservation handles the posting of a reservation form
func (m *Repository) PostReservation(w http.ResponseWriter, r *http.Request) {
	reservation, ok := m.App.Session.Get(r.Context(), "reservation").(models.Reservation)
	if !ok {
		helpers.ServerError(w, errors.New("cannot get reservation from session"))
		return
	}
	err := r.ParseForm()

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	reservation.FirstName = r.Form.Get("first_name")
	reservation.LastName = r.Form.Get("last_name")
	reservation.Email = r.Form.Get("email")
	reservation.Phone = r.Form.Get("phone_number")

	form := forms.New(r.PostForm)

	form.Required("first_name", "last_name", "email")
	form.MinLength("first_name", 3, r)
	form.IsEmail("email")

	if !form.Valid() {
		data := make(map[string]any)
		data["reservation"] = reservation

		render.Template(w, r, "make-reservation.page.tmpl", &models.TemplateData{
			Form: form,
			Data: data,
		})

		return
	}
	newReservationId, err := m.DB.InsertReservation(reservation)

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	restriction := models.RoomRestriction{
		StartDate:     reservation.StartDate,
		EndDate:       reservation.EndDate,
		RoomID:        reservation.RoomID,
		ReservationID: newReservationId,
		RestrictionID: 1,
	}

	err = m.DB.InsertRoomRestriction(restriction)
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	// send email - to guest

	htmlMessage := fmt.Sprintf(`
	<strong>Reservation Confirmation</strong><br>
	Dear: %s: <br>
	This is a confirmation of your reservation from %s to %s.<br>
	`, reservation.FirstName, reservation.StartDate.Format("2006-01-02"), restriction.EndDate)

	msg := models.MailData{
		To:      reservation.Email,
		From:    "me@here.com",
		Subject: "Reservation Confirmation",
		Content: htmlMessage,
	}

	m.App.Mailchan <- msg

	// send email - to property owner
	htmlMessage = fmt.Sprintf(`
	<strong>Reservation Confirmation</strong><br>
	A reservation has been made for %s from %s to %s.<br>
	`, reservation.Room.Name, reservation.StartDate.Format("2006-01-02"), restriction.EndDate)

	msg = models.MailData{
		To:      reservation.Email,
		From:    "me@here.com",
		Subject: "Reservation Confirmation",
		Content: htmlMessage,
	}

	m.App.Mailchan <- msg

	m.App.Session.Put(r.Context(), "reservation", reservation)
	http.Redirect(w, r, "/reservation-summary", http.StatusSeeOther)
}

// renders Generals page
func (m *Repository) Generals(w http.ResponseWriter, r *http.Request) {
	render.Template(w, r, "generals.page.tmpl", &models.TemplateData{})
}

// renders Majors page
func (m *Repository) Majors(w http.ResponseWriter, r *http.Request) {
	render.Template(w, r, "majors.page.tmpl", &models.TemplateData{})
}

// renders Availability page
func (m *Repository) Availability(w http.ResponseWriter, r *http.Request) {
	render.Template(w, r, "search-availability.page.tmpl", &models.TemplateData{})
}

// renders Availability page
func (m *Repository) PostAvailability(w http.ResponseWriter, r *http.Request) {
	start := r.Form.Get("start")
	end := r.Form.Get("end")

	layout := "2006-01-02" // MM/DD/YYYY

	startDate, err := time.Parse(layout, start)
	if err != nil {
		helpers.ServerError(w, err)
		return
	}
	endDate, err := time.Parse(layout, end)

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	rooms, err := m.DB.SearchAvailabilityForAllRooms(startDate, endDate)
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	if len(rooms) == 0 {
		m.App.Session.Put(r.Context(), "error", "No availability found")
		http.Redirect(w, r, "/search-availability", http.StatusSeeOther)
		return
	}
	data := make(map[string]any)
	data["rooms"] = rooms

	res := models.Reservation{
		StartDate: startDate,
		EndDate:   endDate,
	}

	m.App.Session.Put(r.Context(), "reservation", res)

	render.Template(w, r, "choose-room.page.tmpl", &models.TemplateData{
		Data: data,
	})

}

func (m *Repository) AvailabilityJson(w http.ResponseWriter, r *http.Request) {

	sd := r.Form.Get("start")
	ed := r.Form.Get("end")

	roomID, _ := strconv.Atoi(r.Form.Get("room_id"))
	layout := "2006-01-02" // MM/DD/YYYY
	startDate, _ := time.Parse(layout, sd)
	endDate, _ := time.Parse(layout, ed)

	available, _ := m.DB.SearchAvailabilityByDatesByRoomID(startDate, endDate, roomID)

	resp := jsonResponse{
		OK:        available,
		Message:   "",
		RoomID:    strconv.Itoa(roomID),
		StartDate: sd,
		EndDate:   ed,
	}

	out, err := json.MarshalIndent(resp, "", "	")
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(out)
}

// renders Contact page
func (m *Repository) Contact(w http.ResponseWriter, r *http.Request) {
	render.Template(w, r, "contact.page.tmpl", &models.TemplateData{})
}

func (m *Repository) ReservationSummary(w http.ResponseWriter, r *http.Request) {
	reservation, ok := m.App.Session.Get(r.Context(), "reservation").(models.Reservation)

	if !ok {
		m.App.ErrorLog.Println("cannot get reservation from session")
		m.App.Session.Put(r.Context(), "error", "cannot get reservation from session")
		http.Redirect(w, r, "/", http.StatusTemporaryRedirect)
		return
	}

	m.App.Session.Remove(r.Context(), "reservation")

	data := make(map[string]any)
	data["reservation"] = reservation

	startDate := reservation.StartDate.Format("2006-01-02")
	endDate := reservation.EndDate.Format("2006-01-02")

	stringMap := make(map[string]string)
	stringMap["start_date"] = startDate
	stringMap["end_date"] = endDate

	render.Template(w, r, "reservation-summary.page.tmpl", &models.TemplateData{
		Data:      data,
		StringMap: stringMap,
	})
}

// ChooseRoom displays available rooms
func (m *Repository) ChooseRoom(w http.ResponseWriter, r *http.Request) {
	roomID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	res, ok := m.App.Session.Get(r.Context(), "reservation").(models.Reservation)
	if !ok {
		helpers.ServerError(w, err)
		return
	}

	res.RoomID = roomID
	m.App.Session.Put(r.Context(), "reservation", res)

	http.Redirect(w, r, "/make-reservation", http.StatusSeeOther)
}

// BookRoom handles the booking of a room
func (m *Repository) BookRoom(w http.ResponseWriter, r *http.Request) {

	roomID, _ := strconv.Atoi(r.URL.Query().Get("id"))
	startDate := r.URL.Query().Get("s")
	endDate := r.URL.Query().Get("e")

	var res models.Reservation

	room, err := m.DB.GetRoomByID(roomID)
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	res.Room.Name = room.Name
	res.RoomID = roomID
	res.StartDate, _ = time.Parse("2006-01-02", startDate)
	res.EndDate, _ = time.Parse("2006-01-02", endDate)

	m.App.Session.Put(r.Context(), "reservation", res)

	http.Redirect(w, r, "/make-reservation", http.StatusSeeOther)
}

func (m *Repository) ShowLogin(w http.ResponseWriter, r *http.Request) {
	render.Template(w, r, "login.page.tmpl", &models.TemplateData{
		Form: forms.New(nil),
	})
}

// PostLogin handles the login form submission
func (m *Repository) PostLogin(w http.ResponseWriter, r *http.Request) {
	_ = m.App.Session.RenewToken(r.Context())

	err := r.ParseForm()

	if err != nil {
		log.Println(err)
	}

	email := r.Form.Get("email")
	password := r.Form.Get("password")

	form := forms.New(r.PostForm)
	form.Required("email", "password")
	form.IsEmail("email")

	if !form.Valid() {
		render.Template(w, r, "login.page.tmpl", &models.TemplateData{
			Form: form,
		})
		return
	}

	id, _, err := m.DB.Authenticate(email, password)

	if err != nil {
		log.Println(err)
		m.App.Session.Put(r.Context(), "error", "Invalid login credentials")
		http.Redirect(w, r, "/user/login", http.StatusSeeOther)
		return
	}

	m.App.Session.Put(r.Context(), "user_id", id)
	m.App.Session.Put(r.Context(), "flash", "Logged in successfully")

	http.Redirect(w, r, "/", http.StatusSeeOther)

}

// Logout handles the logout process
// It destroys the session and redirects to the login page
func (m *Repository) Logout(w http.ResponseWriter, r *http.Request) {
	m.App.Session.Destroy(r.Context())
	m.App.Session.RenewToken(r.Context())

	http.Redirect(w, r, "/user/login", http.StatusSeeOther)
}

// Get Listings
func (m *Repository) GetListings(w http.ResponseWriter, r *http.Request) {
	// listings := []Listing{
	// 	MockListings
	// }

	response := ListingsResponse{
		Data: MockListings,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

// Get Listing Details
func (m *Repository) GetListingDetails(w http.ResponseWriter, r *http.Request) {

	response := ListingDetailsResponse{
		Data: MockListingDetails,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

// GetListingReviews fetches reviews for a specific listing
func (m *Repository) GetListingReviews(w http.ResponseWriter, r *http.Request) {
	idParam := chi.URLParam(r, "id")
	listingID, err := strconv.Atoi(idParam)
	if err != nil {
		http.Error(w, "Invalid listing ID", http.StatusBadRequest)
		return
	}

	fmt.Printf("Fetching reviews for listing ID: %d\n", listingID)

	reviews, found := MockListingReviews[listingID]
	if !found {
		reviews = []Review{}
	}

	var totalRating float64
	for _, review := range reviews {
		totalRating += float64(review.Rating)
	}
	avgRating := 0.0
	if len(reviews) > 0 {
		avgRating = totalRating / float64(len(reviews))
	}

	response := ReviewResponse{
		ListingID:     listingID,
		AverageRating: avgRating,
		TotalReviews:  len(reviews),
		Reviews:       reviews,
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(response)
}

// Admin Related Handlers
//
// AdminDashboard displays the admin dashboard
func (m *Repository) AdminDashboard(w http.ResponseWriter, r *http.Request) {
	render.Template(w, r, "admin-dashboard.page.tmpl", &models.TemplateData{})
}

// AdminNewReservations displays all new reservations in admin tool
func (m *Repository) AdminNewReservations(w http.ResponseWriter, r *http.Request) {
	reservations, err := m.DB.AllNewReservations()
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	data := make(map[string]any)
	data["reservations"] = reservations
	render.Template(w, r, "admin-new-reservations.page.tmpl", &models.TemplateData{
		Data: data,
	})
}

// AdminAllReservations displays all reservations in admin tool
func (m *Repository) AdminAllReservations(w http.ResponseWriter, r *http.Request) {
	reservations, err := m.DB.AllReservations()
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	data := make(map[string]any)
	data["reservations"] = reservations

	render.Template(w, r, "admin-all-reservations.page.tmpl", &models.TemplateData{
		Data: data,
	})
}

// AdminShowReservation displays a specific reservation in admin tool
func (m *Repository) AdminShowReservation(w http.ResponseWriter, r *http.Request) {
	exploded := strings.Split(r.RequestURI, "/")
	id, err := strconv.Atoi(exploded[4])

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	src := exploded[3]

	stringMap := make(map[string]string)
	stringMap["src"] = src

	res, err := m.DB.GetReservationByID(id)

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	data := make(map[string]any)
	data["reservation"] = res

	render.Template(w, r, "admin-reservations-show.page.tmpl", &models.TemplateData{
		StringMap: stringMap,
		Data:      data,
		Form:      forms.New(nil),
	})
}

func (m *Repository) AdminReservationsCalendar(w http.ResponseWriter, r *http.Request) {
	now := time.Now()

	if r.URL.Query().Get("y") != "" {
		year, _ := strconv.Atoi(r.URL.Query().Get("y"))
		month, _ := strconv.Atoi(r.URL.Query().Get("m"))

		now = time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	}

	data := make(map[string]any)
	data["now"] = now

	next := now.AddDate(0, 1, 0)
	prev := now.AddDate(0, -1, 0)

	nextMonth := next.Format("01")
	nextMonthYear := next.Format("2006")

	prevMonth := prev.Format("01")
	prevMonthYear := prev.Format("2006")

	stringMap := make(map[string]string)
	stringMap["next_month"] = nextMonth
	stringMap["next_month_year"] = nextMonthYear
	stringMap["prev_month"] = prevMonth
	stringMap["prev_month_year"] = prevMonthYear

	stringMap["this_month"] = now.Format("01")
	stringMap["this_month_year"] = now.Format("2006")

	// get the first and last days of the month
	currentYear, currentMonth, _ := now.Date()
	currentLocation := now.Location()
	firstOfMonth := time.Date(currentYear, currentMonth, 1, 0, 0, 0, 0, currentLocation)
	lastOfMonth := firstOfMonth.AddDate(0, 1, -1)

	intMap := make(map[string]int)
	intMap["days_in_month"] = lastOfMonth.Day()

	rooms, err := m.DB.AllRooms()

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	data["rooms"] = rooms

	for _, room := range rooms {
		reservationMap := make(map[string]int)
		blockMap := make(map[string]int)

		for d := firstOfMonth; !d.After(lastOfMonth); d = d.AddDate(0, 0, 1) {
			reservationMap[d.Format("2006-01-02")] = 0
			blockMap[d.Format("2006-01-02")] = 0
		}

		restrictions, err := m.DB.GetRestrictionsForRoomByDate(room.ID, firstOfMonth, lastOfMonth)

		if err != nil {
			helpers.ServerError(w, err)
			return
		}

		for _, restriction := range restrictions {
			if restriction.ReservationID > 0 {
				// its a reservation

				for d := restriction.StartDate; !d.After(restriction.EndDate); d = d.AddDate(0, 0, 1) {
					reservationMap[d.Format("2006-01-02")] = restriction.ReservationID
				}

			} else {
				// its a block
				blockMap[restriction.StartDate.Format("2006-01-02")] = restriction.ID
			}
		}

		data[fmt.Sprintf("reservation_map_%d", room.ID)] = reservationMap
		data[fmt.Sprintf("block_map_%d", room.ID)] = blockMap

		m.App.Session.Put(r.Context(), fmt.Sprintf("block_map_%d", room.ID), blockMap)

	}

	render.Template(w, r, "admin-reservations-calendar.page.tmpl", &models.TemplateData{
		StringMap: stringMap,
		Data:      data,
		IntMap:    intMap,
	})
}

// AdminPostReservationsCalendar handles the posting of the reservations calendar form
func (m *Repository) AdminPostReservationsCalendar(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	year, _ := strconv.Atoi(r.Form.Get("y"))
	month, _ := strconv.Atoi(r.Form.Get("m"))

	// process blocks
	rooms, err := m.DB.AllRooms()
	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	form := forms.New(r.PostForm)

	for _, room := range rooms {
		currentMap := m.App.Session.Get(r.Context(), fmt.Sprintf("block_map_%d", room.ID)).(map[string]int)
		for name, value := range currentMap {

			if val, ok := currentMap[name]; ok {
				// only pay attention to values > 0
				if val > 0 {
					if !form.Has(fmt.Sprintf("remove_block_%d_%s", room.ID, name), r) {
						err := m.DB.DeleteBlockByID(value)

						if err != nil {
							log.Println(err)
						}
					}
				}
			}
		}
	}

	// Handle new blocks
	for name, _ := range r.PostForm {
		if strings.HasPrefix(name, "add_block") {
			exploded := strings.Split(name, "_")
			roomID, _ := strconv.Atoi(exploded[2])
			startDate, _ := time.Parse("2006-01-02", exploded[3])

			err := m.DB.InsertBlockForRoom(roomID, startDate)
			if err != nil {
				log.Println(err)
			}
		}
	}

	m.App.Session.Put(r.Context(), "flash", "Changes saved successfully")
	http.Redirect(w, r, fmt.Sprintf("/admin/reservations-calendar?y=%d&m=%d", year, month), http.StatusSeeOther)
}

func (m *Repository) AdminPostShowReservation(w http.ResponseWriter, r *http.Request) {

	err := r.ParseForm()

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	exploded := strings.Split(r.RequestURI, "/")
	id, err := strconv.Atoi(exploded[4])

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	src := exploded[3]

	stringMap := make(map[string]string)
	stringMap["src"] = src

	res, err := m.DB.GetReservationByID(id)

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	res.FirstName = r.Form.Get("first_name")
	res.LastName = r.Form.Get("last_name")
	res.Email = r.Form.Get("email")
	res.Phone = r.Form.Get("phone")

	err = m.DB.UpdateReservation(res)

	if err != nil {
		helpers.ServerError(w, err)
		return
	}

	m.App.Session.Put(r.Context(), "flash", "Changes saved successfully")

	http.Redirect(w, r, fmt.Sprintf("/admin/reservations-%s", src), http.StatusSeeOther)
}

// AdminProcessReservation marks a reservation as processed
func (m *Repository) AdminProcessReservation(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	src := chi.URLParam(r, "src")

	_ = m.DB.UpdateProcessedForReservation(id, 1)

	m.App.Session.Put(r.Context(), "flash", "Reservation processed successfully")

	http.Redirect(w, r, fmt.Sprintf("/admin/reservations-%s", src), http.StatusSeeOther)
}

// AdminDeleteReservation deletes a reservation
func (m *Repository) AdminDeleteReservation(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(chi.URLParam(r, "id"))
	src := chi.URLParam(r, "src")

	_ = m.DB.DeleteReservation(id)

	m.App.Session.Put(r.Context(), "flash", "Reservation deleted")

	http.Redirect(w, r, fmt.Sprintf("/admin/reservations-%s", src), http.StatusSeeOther)
}

func (m *Repository) AskAboutReviews(w http.ResponseWriter, r *http.Request) {
	var payload AskPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid JSON payload: "+err.Error(), http.StatusBadRequest)
		return
	}
	if payload.ListingID == "" || payload.Question == "" {
		http.Error(w, "Missing listing_id or question", http.StatusBadRequest)
		return
	}

	listingID, err := strconv.Atoi(payload.ListingID)
	if err != nil {
		http.Error(w, "Invalid listing_id: "+err.Error(), http.StatusBadRequest)
		return
	}

	reviews, found := MockListingReviews[listingID]
	if !found || len(reviews) == 0 {
		http.Error(w, "No reviews found for listing", http.StatusNotFound)
		return
	}

	// Instead of combining comments, marshal entire reviews slice
	reviewsJSON, err := json.Marshal(reviews)
	if err != nil {
		http.Error(w, "Failed to encode reviews: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Build JSON request to Python LLM microservice
	pythonReq := map[string]interface{}{
		"listing_id": payload.ListingID,
		"question":   payload.Question,
		"reviews":    json.RawMessage(reviewsJSON), // keep as raw JSON array
	}
	reqBody, err := json.Marshal(pythonReq)
	if err != nil {
		http.Error(w, "Failed to encode request to Python: "+err.Error(), http.StatusInternalServerError)
		return
	}

	resp, err := http.Post("http://llm-service:8000/ask", "application/json", bytes.NewBuffer(reqBody))

	if err != nil {
		http.Error(w, "Failed to contact Python LLM service: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		http.Error(w, "Python service error: "+string(body), http.StatusInternalServerError)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		http.Error(w, "Failed to read Python response: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}
