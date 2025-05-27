package main

import (
	"log"
	"time"

	"github.com/bijay11/bookings/internal/models"
	mail "github.com/xhit/go-simple-mail/v2"
)

func listenForMail() {
	go func() {
		for {
			// Wait for mail data to be sent to the channel
			msg := <-app.Mailchan

			sendMessage(msg)

		}
	}()
}

func sendMessage(m models.MailData) {
	server := mail.NewSMTPClient()
	server.Host = "localhost"
	server.Port = 1025
	server.KeepAlive = false
	server.ConnectTimeout = 10 * time.Second
	server.SendTimeout = 10 * time.Second

	client, err := server.Connect()

	if err != nil {
		errorLog.Println("Error connecting to mail server:", err)

	}
	email := mail.NewMSG()
	email.SetFrom(m.From).AddTo(m.To).SetSubject(m.Subject)
	email.SetBody(mail.TextHTML, m.Content)

	err = email.Send(client)
	if err != nil {
		errorLog.Println("Error sending email:", err)
	} else {
		log.Println("Email sent successfully to", m.To)
	}
}
