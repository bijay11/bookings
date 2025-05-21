package repository

import "github.com/bijay11/bookings/internal/models"

type DatabaseRepo interface {
	AllUsers() bool
	InsertReservation(reservation models.Reservation) (int, error)
	InsertRoomRestriction(r models.RoomRestriction) error
}
