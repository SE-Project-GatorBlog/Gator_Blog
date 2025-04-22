package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"
	"Gator_blog/redis"
	"fmt"
	"log"
	"time"

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

	//Create cache key
	cacheKey := fmt.Sprintf("user:%d:blogs", user.ID)
	if titleFilter != "" {
		cacheKey = fmt.Sprintf("user:%d:blogs:title:%s", user.ID, titleFilter)
	}

	// Retrieve blogs for the user
	var blogs []model.Blog
	found, err := redis.GetCache(cacheKey, &blogs)
	if err != nil {
		log.Println("Reddis error: ", err)
	}

	if found { //cache hit
		log.Println("Cache hit for ", cacheKey)
		context["blogs"] = blogs
		c.Status(200)
		return c.JSON(context)

	}
	//cache miss
	log.Println("Cache miss for ", cacheKey)
	query := database.DBConn.Where("user_id = ?", user.ID)

	if titleFilter != "" {
		query = query.Where("title LIKE ?", "%"+titleFilter+"%")
	}
	result = query.Find(&blogs)

	if result.Error != nil {
		log.Println("Error fetching blogs", err)
		context["statusText"] = "error"
		context["msg"] = "Could not fetch blogs"
		return c.JSON(context)
	}
	//store in redis
	err = redis.SetCache(cacheKey, blogs, 10*time.Minute)
	if err != nil {
		log.Println("Error setting cache", err)
	}
	context["blogs"] = blogs
	c.Status(200)
	return c.JSON(context)

}

// Fetches a single blog by ID
func BlogFetch(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Fetch Blog",
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
		log.Println("User not found")
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.Status(404).JSON(context)
	}

	// Get blog ID from params
	blogID := c.Params("id")
	if blogID == "" {
		context["statusText"] = "error"
		context["msg"] = "Blog ID is required"
		return c.Status(400).JSON(context)
	}

	//setup cachekey
	cacheKey := fmt.Sprintf("user:%d:blog:%s", user.ID, blogID)

	// Retrieve the specific blog
	var blog model.Blog

	found, err := redis.GetCache(cacheKey, &blog)
	if err != nil {
		log.Println("Reddis error: ", err)
	}
	if found { //cache hit
		log.Println("Cache hit for ", cacheKey)
		context["blog"] = blog
		return c.Status(200).JSON(context)
	}
	//cache miss
	log.Println("Cache miss for ", cacheKey)

	//result = database.DBConn.Where("id = ? AND user_id = ?", blogID, user.ID).First(&blog)
	// Sritha
	result = database.DBConn.Where("id = ?", blogID).First(&blog)
	if result.Error != nil {
		log.Println("Blog not found")
		context["statusText"] = "error"
		context["msg"] = "Blog not found"
		return c.Status(404).JSON(context)
	}
	err = redis.SetCache(cacheKey, blog, 10*time.Minute)
	if err != nil {
		log.Println("Error setting cache", err)
	}

	context["blog"] = blog
	return c.Status(200).JSON(context)
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
	blog.UserName = user.Username

	result = database.DBConn.Create(&blog)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "Could not create blog"
		return c.Status(500).JSON(context)
	}
	context["msg"] = "Blog created successfully"
	context["blog"] = blog

	// Invalidate cache since we created a new blog
	cacheKey := fmt.Sprintf("user:%d:blogs", user.ID)
	redis.DeleteCache(cacheKey)

	// Invalidate title specific cache entries
	pattern := fmt.Sprintf("user:%d:blogs:title:*", user.ID)
	keys, _ := redis.RedisClient.Keys(redis.Ctx, pattern).Result()
	if len(keys) > 0 {
		redis.RedisClient.Del(redis.Ctx, keys...)
	}
	log.Println("Invalidate cache for", cacheKey)
	log.Println("Invalidate cache for", pattern)
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

	// Invalidate caches for this specific blog and the blogs list
	blogCacheKey := fmt.Sprintf("user:%d:blog:%s", user.ID, blogID)
	listCacheKey := fmt.Sprintf("user:%d:blogs", user.ID)

	redis.DeleteCache(blogCacheKey)
	redis.DeleteCache(listCacheKey)
	log.Println("Invalidate cache for", blogCacheKey)
	log.Println("Invalidate cache for", listCacheKey)
	// Invalidate title-specific cache entries
	pattern := fmt.Sprintf("user:%d:blogs:title:*", user.ID)
	keys, _ := redis.RedisClient.Keys(redis.Ctx, pattern).Result()
	if len(keys) > 0 {
		redis.RedisClient.Del(redis.Ctx, keys...)
	}
	log.Println("Invalidate cache for", pattern)
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

	// Invalidate caches for this specific blog and the blogs list
	blogCacheKey := fmt.Sprintf("user:%d:blog:%s", user.ID, blogID)
	listCacheKey := fmt.Sprintf("user:%d:blogs", user.ID)
	log.Println("Invalidate cache for", blogCacheKey)
	log.Println("Invalidate cache for", listCacheKey)
	redis.DeleteCache(blogCacheKey)
	redis.DeleteCache(listCacheKey)

	// Invalidate title-specific cache entries
	pattern := fmt.Sprintf("user:%d:blogs:title:*", user.ID)
	keys, _ := redis.RedisClient.Keys(redis.Ctx, pattern).Result()
	if len(keys) > 0 {
		redis.RedisClient.Del(redis.Ctx, keys...)
	}
	log.Println("Invalidate cache for", pattern)
	return c.Status(200).JSON(context)
}

// fetches blogs of a particular user based on user_id
func BlogListWithMeta(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Blogs with Meta",
	}

	userEmail, ok := c.Locals("userEmail").(string)
	if !ok || userEmail == "" {
		context["statusText"] = "error"
		context["msg"] = "Unauthorized"
		return c.Status(401).JSON(context)
	}

	var user model.User
	result := database.DBConn.Where("email = ?", userEmail).First(&user)
	if result.Error != nil {
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.Status(404).JSON(context)
	}

	searchQuery := c.Query("search")
	var blogs []model.Blog

	query := database.DBConn.Where("user_id = ?", user.ID)

	if searchQuery != "" {
		likePattern := "%" + searchQuery + "%"
		query = query.Where("title LIKE ? OR post LIKE ?", likePattern, likePattern)
	}

	if err := query.Find(&blogs).Error; err != nil {
		context["statusText"] = "error"
		context["msg"] = "Failed to fetch blogs"
		return c.Status(500).JSON(context)
	}

	var enrichedBlogs []BlogWithMeta
	for _, blog := range blogs {
		var likeCount int64
		database.DBConn.Model(&model.Like{}).Where("blog_id = ?", blog.ID).Count(&likeCount)

		var comments []model.Comment
		database.DBConn.Where("blog_id = ?", blog.ID).Find(&comments)

		enrichedBlogs = append(enrichedBlogs, BlogWithMeta{
			ID:        blog.ID,
			Title:     blog.Title,
			Post:      blog.Post,
			CreatedAt: blog.CreatedAt,
			UpdatedAt: blog.UpdatedAt,
			Likes:     likeCount,
			Comments:  comments,
		})
	}

	context["blogs"] = enrichedBlogs
	return c.Status(200).JSON(context)
}

// fetches blogs of all users
func AllBlogsWithMeta(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "All Blogs with Meta",
	}
	searchQuery := c.Query("search")
	var blogs []model.Blog
	query := database.DBConn

	if searchQuery != "" {
		likePattern := "%" + searchQuery + "%"
		query = query.Where("title LIKE ? OR post LIKE ?", likePattern, likePattern)
	}
	if err := query.Find(&blogs).Error; err != nil {
		context["statusText"] = "error"
		context["msg"] = "Failed to fetch blogs"
		return c.Status(500).JSON(context)
	}

	var enrichedBlogs []BlogWithMeta
	for _, blog := range blogs {
		// Get likes count
		var likeCount int64
		database.DBConn.Model(&model.Like{}).Where("blog_id = ?", blog.ID).Count(&likeCount)

		// Get comments
		var comments []model.Comment
		database.DBConn.Where("blog_id = ?", blog.ID).Find(&comments)

		enrichedBlogs = append(enrichedBlogs, BlogWithMeta{
			ID:        blog.ID,
			Title:     blog.Title,
			Post:      blog.Post,
			UserID:    blog.UserID,
			UserName:  blog.UserName,
			CreatedAt: blog.CreatedAt,
			UpdatedAt: blog.UpdatedAt,
			Likes:     likeCount,
			Comments:  comments,
		})
	}

	context["blogs"] = enrichedBlogs
	return c.Status(200).JSON(context)
}

// fetches popular blogs based on likes
func Top5PopularBlogs(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "Top 5 Popular Blogs",
	}

	type Result struct {
		BlogID uint
		Count  int64
	}

	var results []Result
	// Step 1: Get top 5 blog IDs by like count
	if err := database.DBConn.
		Model(&model.Like{}).
		Select("blog_id as blog_id, COUNT(*) as count").
		Group("blog_id").
		Order("count DESC").
		Limit(5).
		Scan(&results).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch top blogs"})
	}
	// log.Println("results---", results)
	var popularblogs []BlogWithMeta
	for _, res := range results {
		var blog model.Blog
		if err := database.DBConn.Where("id = ?", res.BlogID).Find(&blog).Error; err != nil {
			continue
		}

		popularblogs = append(popularblogs, BlogWithMeta{
			ID:        blog.ID,
			Title:     blog.Title,
			Post:      blog.Post,
			UserID:    blog.UserID,
			UserName:  blog.UserName,
			CreatedAt: blog.CreatedAt,
			UpdatedAt: blog.UpdatedAt,
			Likes:     res.Count,
		})
		// log.Println("popular blogs", popularblogs)
	}
	// log.Println("popular blogs---", popularblogs)
	context["blogs"] = popularblogs
	return c.Status(200).JSON(context)
}
