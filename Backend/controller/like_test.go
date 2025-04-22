package controller_test

import (
	"Gator_blog/controller"
	"Gator_blog/database"
	"Gator_blog/model"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func setupTestDB() {
	var err error
	database.DBConn, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to test database")
	}

	// Migrate the schema
	database.DBConn.AutoMigrate(&model.User{}, &model.Blog{}, &model.Like{})
}

func setupApp() *fiber.App {
	app := fiber.New()

	// Setup routes for testing
	app.Post("/blogs/:id/like", func(c *fiber.Ctx) error {
		// Mock authentication middleware
		c.Locals("userEmail", "test@example.com")
		return controller.LikeBlog(c)
	})

	app.Get("/blogs/:id/likes", controller.GetLikesByBlogID)

	return app
}

func TestLikeBlog(t *testing.T) {
	// Setup
	setupTestDB()
	app := setupApp()

	// Create test user
	user := model.User{
		Email: "test@example.com",
	}
	database.DBConn.Create(&user)

	// Create test blog
	blog := model.Blog{
		Title: "Test Blog",
	}
	database.DBConn.Create(&blog)

	// Test cases
	t.Run("Successfully like a blog", func(t *testing.T) {
		// Setup request
		req := httptest.NewRequest(http.MethodPost, "/blogs/"+fmt.Sprintf("%d", blog.ID)+"/like", nil)
		resp, err := app.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusCreated, resp.StatusCode)

		// Check if like was created in DB
		var count int64
		database.DBConn.Model(&model.Like{}).Where("user_id = ? AND blog_id = ?", user.ID, blog.ID).Count(&count)
		assert.Equal(t, int64(1), count)
	})

	t.Run("Try to like blog that doesn't exist", func(t *testing.T) {
		// Setup request with non-existent blog ID
		req := httptest.NewRequest(http.MethodPost, "/blogs/9999/like", nil)
		resp, err := app.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		// Check response body
		var respBody map[string]string
		json.NewDecoder(resp.Body).Decode(&respBody)
		assert.Equal(t, "Blog not found", respBody["error"])
	})

	t.Run("Try to like a blog twice", func(t *testing.T) {
		// First like
		req := httptest.NewRequest(http.MethodPost, "/blogs/"+fmt.Sprintf("%d", blog.ID)+"/like", nil)
		_, _ = app.Test(req)

		// Try to like again
		req = httptest.NewRequest(http.MethodPost, "/blogs/"+fmt.Sprintf("%d", blog.ID)+"/like", nil)
		resp, err := app.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusBadRequest, resp.StatusCode)

		// Check response body
		var respBody map[string]string
		json.NewDecoder(resp.Body).Decode(&respBody)
		assert.Equal(t, "Already liked", respBody["msg"])
	})
}

func TestGetLikesByBlogID(t *testing.T) {
	// Setup
	setupTestDB()
	app := setupApp()

	// Create test user
	user := model.User{
		Email: "test@example.com",
	}
	database.DBConn.Create(&user)

	// Create test blog
	blog := model.Blog{
		Title: "Test Blog",
	}
	database.DBConn.Create(&blog)

	// Test cases
	t.Run("Get likes count for blog with no likes", func(t *testing.T) {
		// Setup request
		req := httptest.NewRequest(http.MethodGet, "/blogs/"+fmt.Sprintf("%d", blog.ID)+"/likes", nil)
		resp, err := app.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Check response body
		var respBody map[string]int64
		json.NewDecoder(resp.Body).Decode(&respBody)
		assert.Equal(t, int64(0), respBody["likes"])
	})

	t.Run("Get likes count for blog with likes", func(t *testing.T) {
		// Add likes to the blog
		like := model.Like{
			UserID: user.ID,
			BlogID: blog.ID,
		}
		database.DBConn.Create(&like)

		// Setup request
		req := httptest.NewRequest(http.MethodGet, "/blogs/"+fmt.Sprintf("%d", blog.ID)+"/likes", nil)
		resp, err := app.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Check response body
		var respBody map[string]int64
		json.NewDecoder(resp.Body).Decode(&respBody)
		assert.Equal(t, int64(1), respBody["likes"])
	})

	t.Run("Get likes for non-existent blog", func(t *testing.T) {
		// Setup request with non-existent blog ID
		req := httptest.NewRequest(http.MethodGet, "/blogs/9999/likes", nil)
		resp, err := app.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusOK, resp.StatusCode)

		// Check response body - should return 0 likes, not an error
		var respBody map[string]int64
		json.NewDecoder(resp.Body).Decode(&respBody)
		assert.Equal(t, int64(0), respBody["likes"])
	})
}

func TestLikeBlogWithMockedDependencies(t *testing.T) {
	// Setup
	setupTestDB()

	// Create test blog
	blog := model.Blog{
		Title: "Test Blog",
	}
	database.DBConn.Create(&blog)

	t.Run("User not found test", func(t *testing.T) {
		// Setup custom app
		customApp := fiber.New()
		customApp.Post("/blogs/:id/like", func(c *fiber.Ctx) error {
			// Mock different email that doesn't exist
			c.Locals("userEmail", "nonexistent@example.com")
			return controller.LikeBlog(c)
		})

		// Setup request
		req := httptest.NewRequest(http.MethodPost, "/blogs/"+fmt.Sprintf("%d", blog.ID)+"/like", nil)
		resp, err := customApp.Test(req)

		// Assert
		assert.NoError(t, err)
		assert.Equal(t, http.StatusNotFound, resp.StatusCode)

		// Check response body
		var respBody map[string]string
		json.NewDecoder(resp.Body).Decode(&respBody)
		assert.Equal(t, "User not found", respBody["error"])
	})
}