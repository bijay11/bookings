package repository

import (
	"time"

	"github.com/bijay11/bookings/internal/models"
)

type DatabaseRepo interface {
	AllUsers() bool
	InsertReservation(reservation models.Reservation) (int, error)
	InsertRoomRestriction(r models.RoomRestriction) error
	SearchAvailabilityByDatesByRoomID(start, end time.Time, roomID int) (bool, error)
	SearchAvailabilityForAllRooms(start, end time.Time) ([]models.Room, error)
	GetRoomByID(id int) (models.Room, error)
}
