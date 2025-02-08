package router

import (
	"Gator_blog/controller"

	"github.com/gofiber/fiber/v2"
)

// setup routing information
func SetupRoutes(app *fiber.App) {

	app.Post("/signin", controller.SignIn)
	app.Post("/signup", controller.SignUp)

	app.Get("/", controller.BlogList)
	app.Post("/", controller.BlogCreate)
	app.Put("/", controller.BlogUpdate)
	app.Delete("/", controller.BlogDelete)
}
