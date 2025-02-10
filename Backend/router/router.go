package router

import (
	"Gator_blog/controller"
	"Gator_blog/middleware"

	"github.com/gofiber/fiber/v2"
)

// setup routing information
func SetupRoutes(app *fiber.App) {

	api := app.Group("/api")
	api.Post("/signin", controller.SignIn)
	api.Post("/signup", controller.SignUp)

	// Protect blog routes with JWT middleware
	protected := api.Group("/", middleware.JWTMiddleware())

	protected.Get("/", controller.BlogList)
	protected.Post("/", controller.BlogCreate)
	protected.Put("/", controller.BlogUpdate)
	protected.Delete("/", controller.BlogDelete)
}
