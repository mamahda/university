package main

import (
	// "log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	serverUpTime := time.Now();

	// TODO CORS CONFIGURATION
	config := cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET"},
	}

	r.Use(cors.New(config))

	// TODO ROUTE CONFIGURATION
	r.GET("/health", func(ctx *gin.Context) {
		timeNow := time.Now()

		ctx.JSON(
			http.StatusOK,
			gin.H{
				"nama": "Gilbran Mahdavikia Raja",
				"nrp": "5025241134",
				"status": "UP",
				"timestamp": timeNow,
				"uptime": serverUpTime,
			},
		)
	})

	r.Run(":8080")
}
