package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"

	"github.com/gofiber/fiber/v2"
)

func AddComment(c *fiber.Ctx) error {
	var comment model.Comment
	if err := c.BodyParser(&comment); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}
	result := database.DBConn.Create(&comment)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to add comment"})
	}
	return c.Status(201).JSON(comment)
}

func GetCommentsByBlogID(c *fiber.Ctx) error {
	blogId := c.Params("id")
	var comments []model.Comment
	result := database.DBConn.Where("blog_id = ?", blogId).Find(&comments)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch comments"})
	}
	return c.JSON(comments)
}
