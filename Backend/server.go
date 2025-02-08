package main

import (
	"Gator_blog/database"
	"Gator_blog/router"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func init() {
	database.ConnectDB()
}
func main() {

	sqlDb, err := database.DBConn.DB()
	if err != nil {
		panic("Issue in database connection!")
	}
	defer sqlDb.Close()

	app := fiber.New()

	app.Use(logger.New())
	router.SetupRoutes(app)

	app.Listen(":8000")
}
