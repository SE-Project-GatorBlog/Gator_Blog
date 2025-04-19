package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"

	"github.com/gofiber/fiber/v2"
)

func LikeBlog(c *fiber.Ctx) error {
	userEmail := c.Locals("userEmail").(string)
	var user model.User
	if err := database.DBConn.Where("email = ?", userEmail).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	blogIDParam := c.Params("id")
	var blog model.Blog
	if err := database.DBConn.Where("id = ?", blogIDParam).First(&blog).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Blog not found"})
	}

	// Prevent duplicate like
	var existing model.Like
	database.DBConn.Where("user_id = ? AND blog_id = ?", user.ID, blog.ID).First(&existing)
	if existing.ID != 0 {
		return c.Status(400).JSON(fiber.Map{"msg": "Already liked"})
	}

	like := model.Like{
		UserID: user.ID,
		BlogID: blog.ID,
	}

	if err := database.DBConn.Create(&like).Error; err != nil {
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
