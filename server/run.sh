#!/bin/bash

go build -o bookings cmd/web/*.go
./bookings -dbname=bookings -dbuser=postgres -dbpass=learndb -cache=false -production=false