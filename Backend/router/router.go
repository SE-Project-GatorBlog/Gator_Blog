package router

import (
	"Gator_blog/controller"

	"github.com/gofiber/fiber/v2"
)

// setup routing information
func SetupRoutes(app *fiber.App) {

	api := app.Group("/api")
	api.Post("/signin", controller.SignIn)
	api.Post("/signup", controller.SignUp)

	api.Get("/", controller.BlogList)
	api.Post("/", controller.BlogCreate)
	api.Put("/", controller.BlogUpdate)
	api.Delete("/", controller.BlogDelete)
}
