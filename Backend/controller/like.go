package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"

	"github.com/gofiber/fiber/v2"
)

func LikeBlog(c *fiber.Ctx) error {
	var like model.Like
	if err := c.BodyParser(&like); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid input"})
	}

	// Prevent duplicate likes
	var existing model.Like
	database.DBConn.Where("user_id = ? AND blog_id = ?", like.UserID, like.BlogID).First(&existing)
	if existing.ID != 0 {
		return c.Status(400).JSON(fiber.Map{"msg": "Already liked"})
	}

	result := database.DBConn.Create(&like)
	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to like blog"})
	}
	return c.Status(201).JSON(like)
}

func GetLikesByBlogID(c *fiber.Ctx) error {
	blogID := c.Params("id")
	var count int64
	database.DBConn.Model(&model.Like{}).Where("blog_id = ?", blogID).Count(&count)
	return c.JSON(fiber.Map{"likes": count})
}
