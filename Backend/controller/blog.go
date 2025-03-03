package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"
	"log"

	"github.com/gofiber/fiber/v2"
)

// Get list of all blogs
func BlogList(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Blog List",
	}

	// Extract user email from middleware/local storage
	userEmail, ok := c.Locals("userEmail").(string)
	log.Println("user email", userEmail)
	if !ok || userEmail == "" {
		log.Println("User email not found in context")
		context["statusText"] = "error"
		context["msg"] = "Unauthorized"
		return c.JSON(context)
	}

	// Find the user by email
	var user model.User
	result := database.DBConn.Where("email = ?", userEmail).First(&user)

	if result.Error != nil {
		log.Println("User not found")
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.JSON(context)
	}

	// Retrieve blogs for the user
	var blogs []model.Blog
	result = database.DBConn.Where("user_id = ?", user.ID).Find(&blogs)

	if result.Error != nil {
		log.Println("Error fetching blogs")
		context["statusText"] = "error"
		context["msg"] = "Could not fetch blogs"
		return c.JSON(context)
	}

	context["blogs"] = blogs
	c.Status(200)
	return c.JSON(context)

}

// Adds a blog
func BlogCreate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Add Blog",
	}
	c.Status(201)
	return c.JSON(context)
}

// Updated a blog
func BlogUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Update Blog for given Id",
	}
	c.Status(200)
	return c.JSON(context)
}

// Deletes a blog
func BlogDelete(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Delete Blog for given Id",
	}
	c.Status(200)
	return c.JSON(context)
}
