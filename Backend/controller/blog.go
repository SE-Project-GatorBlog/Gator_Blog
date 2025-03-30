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

	// Query parameters (e.g., ?title=example)
	titleFilter := c.Query("title")

	// Retrieve blogs for the user
	var blogs []model.Blog
	query := database.DBConn.Where("user_id = ?", user.ID)

	if titleFilter != "" {
		query = query.Where("title LIKE ?", "%"+titleFilter+"%")
	}
	result = query.Find(&blogs)

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
	// Extract user email from middleware/local storage
	userEmail, ok := c.Locals("userEmail").(string)
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
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.Status(404).JSON(context)
	}
	// Parse request body
	var blog model.Blog
	if err := c.BodyParser(&blog); err != nil {
		context["statusText"] = "error"
		context["msg"] = "Invalid input"
		return c.Status(404).JSON(context)
	}

	blog.UserID = user.ID

	result = database.DBConn.Create(&blog)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "Could not create blog"
		return c.Status(500).JSON(context)
	}
	context["msg"] = "Blog created successfully"
	context["blog"] = blog
	return c.Status(201).JSON(context)
}

// Updated a blog
func BlogUpdate(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Add Blog",
	}
	// Extract user email from middleware/local storage
	userEmail, ok := c.Locals("userEmail").(string)
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
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.Status(404).JSON(context)
	}

	// Get blog ID from params
	blogID := c.Params("id")

	// Find the blog
	var blog model.Blog
	result = database.DBConn.Where("id = ? AND user_id = ?", blogID, user.ID).First(&blog)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "Could not fetch blog"
		return c.Status(404).JSON(context)
	}

	// Parse request body
	if err := c.BodyParser(&blog); err != nil {
		context["statusText"] = "error"
		context["msg"] = "Invalid input"
		return c.Status(400).JSON(context)
	}

	result = database.DBConn.Save(&blog)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "Could not update blog"
		return c.Status(500).JSON(context)
	}
	context["msg"] = "Blog updated successfully"
	context["blog"] = blog
	return c.Status(200).JSON(context)
}

// Deletes a blog
func BlogDelete(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Add Blog",
	}
	// Extract user email from middleware/local storage
	userEmail, ok := c.Locals("userEmail").(string)
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
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.Status(404).JSON(context)
	}

	// Get blog ID from params
	blogID := c.Params("id")

	// Find the blog
	var blog model.Blog
	result = database.DBConn.Where("id = ? AND user_id = ?", blogID, user.ID).First(&blog)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "Could not fetch blog"
		return c.Status(404).JSON(context)
	}

	result = database.DBConn.Delete(&blog)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "Could not delete blog"
		return c.Status(500).JSON(context)
	}
	context["msg"] = "Blog deleted successfully"
	context["blog"] = blog
	return c.Status(200).JSON(context)
}
