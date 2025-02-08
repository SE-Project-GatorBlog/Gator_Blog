package controller

import (
	"github.com/gofiber/fiber/v2"
)

// Get list of all blogs
func BlogList(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Blog List",
	}
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
