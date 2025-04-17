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
	api.Post("/request-reset-code", controller.RequestResetCode)
	api.Post("/verify-reset-code", controller.VerifyResetCode)
	api.Post("/reset-password", controller.ResetPasswordWithEmail)

	// Protect blog routes with JWT middleware
	protected := api.Group("/", middleware.JWTMiddleware())

	protected.Get("/blogs", controller.BlogList)
	protected.Get("/blogs/:id", controller.BlogFetch)
	protected.Post("/blogs", controller.BlogCreate)
	protected.Put("/blogs/:id", controller.BlogUpdate)
	protected.Delete("/blogs/:id", controller.BlogDelete)

	// Blog comment and like routes
	protected.Post("/blogs/:id/comments", controller.AddComment)
	protected.Get("/blogs/:id/comments", controller.GetCommentsByBlogID)

	protected.Post("/blogs/:id/likes", controller.LikeBlog)
	protected.Get("/blogs/:id/likes", controller.GetLikesByBlogID)

	protected.Get("/blogs-with-meta", controller.BlogListWithMeta)
}
