package controller_test

import (
	"Gator_blog/controller"
	"Gator_blog/database"
	"Gator_blog/model"
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Define the test suite for the Blog API
type BlogTestSuite struct {
	suite.Suite
	app    *fiber.App
	db     *gorm.DB
	userID uint
	token  string
}

// Setup before each test
func (suite *BlogTestSuite) SetupTest() {
	// Create an in-memory SQLite database for testing
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		suite.T().Fatal("Failed to connect to test database:", err)
	}
	db.AutoMigrate(&model.User{}, &model.Blog{})
	database.DBConn = db
	suite.db = db
	app := fiber.New()

	// Create a middleware to set the user email in locals for testing
	app.Use(func(c *fiber.Ctx) error {
		if suite.token != "" {
			c.Locals("userEmail", "test@example.com")
		}
		return c.Next()
	})

	// Setup all routes
	app.Get("/blogs", controller.BlogList)
	app.Get("/blogs/:id", controller.BlogFetch)
	app.Post("/blogs", controller.BlogCreate)
	app.Put("/blogs/:id", controller.BlogUpdate)
	app.Delete("/blogs/:id", controller.BlogDelete)

	suite.app = app

	// Create a test user
	user := model.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "hashed_password",
	}
	suite.db.Create(&user)
	suite.userID = user.ID
	suite.token = "valid_token"
}

// Cleanup after each test
func (suite *BlogTestSuite) TearDownTest() {
	sqlDB, _ := suite.db.DB()
	sqlDB.Close()
}

// Test fetching blogs when user is not authenticated
func (suite *BlogTestSuite) TestBlogListUnauthorized() {
	suite.token = ""
	req := httptest.NewRequest(http.MethodGet, "/blogs", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Unauthorized", result["msg"])
}

// Test fetching blogs for a user with no blogs
func (suite *BlogTestSuite) TestBlogListEmpty() {
	req := httptest.NewRequest(http.MethodGet, "/blogs", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Blog List", result["msg"])
	blogs, ok := result["blogs"].([]interface{})
	assert.True(suite.T(), ok)
	assert.Equal(suite.T(), 0, len(blogs))
}

// Test fetching blogs for a user with blogs
func (suite *BlogTestSuite) TestBlogListWithBlogs() {
	blogs := []model.Blog{
		{Title: "Test Blog 1", Post: "Post content 1", UserID: suite.userID},
		{Title: "Test Blog 2", Post: "Post content 2", UserID: suite.userID},
		{Title: "Test Blog 3", Post: "Post content 3", UserID: suite.userID},
	}

	for _, blog := range blogs {
		suite.db.Create(&blog)
	}
	req := httptest.NewRequest(http.MethodGet, "/blogs", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Blog List", result["msg"])

	blogsResult, ok := result["blogs"].([]interface{})

	assert.True(suite.T(), ok)
	assert.Equal(suite.T(), 3, len(blogsResult))
}

// Test fetching blogs for a user with non-existent email
func (suite *BlogTestSuite) TestBlogListUserNotFound() {
	suite.app = fiber.New()
	suite.app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "nonexistent@example.com")
		return c.Next()
	})
	suite.app.Get("/blogs", controller.BlogList)
	req := httptest.NewRequest(http.MethodGet, "/blogs", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "User not found", result["msg"])
}

// Test with database error when fetching blogs
func (suite *BlogTestSuite) TestBlogListDatabaseError() {
	blog := model.Blog{Title: "Test Blog", Post: "Post content", UserID: suite.userID}
	suite.db.Create(&blog)
	tx := suite.db.Begin()
	originalDB := database.DBConn
	database.DBConn = tx
	tx.Rollback()
	req := httptest.NewRequest(http.MethodGet, "/blogs", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	database.DBConn = originalDB
}

// Test blogs belonging to different users are properly segregated
func (suite *BlogTestSuite) TestBlogListUserSegregation() {

	// Create another user
	otherUser := model.User{
		Username: "otheruser",
		Email:    "other@example.com",
		Password: "hashed_password",
	}
	suite.db.Create(&otherUser)

	// Create blogs for both users
	blogs := []model.Blog{
		{Title: "Test Blog 1", Post: "Post content 1", UserID: suite.userID},
		{Title: "Test Blog 2", Post: "Post content 2", UserID: suite.userID},
		{Title: "Other User Blog 1", Post: "Other Post content 1", UserID: otherUser.ID},
		{Title: "Other User Blog 2", Post: "Other Post content 2", UserID: otherUser.ID},
	}

	for _, blog := range blogs {
		suite.db.Create(&blog)
	}

	req := httptest.NewRequest(http.MethodGet, "/blogs", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Blog List", result["msg"])

	blogsResult, ok := result["blogs"].([]interface{})
	assert.True(suite.T(), ok)
	assert.Equal(suite.T(), 2, len(blogsResult))

	if len(blogsResult) > 0 {
		blog := blogsResult[0].(map[string]interface{})
		assert.Contains(suite.T(), blog, "Title")
		assert.Contains(suite.T(), blog, "Post")
		assert.Contains(suite.T(), blog, "ID")
		assert.Contains(suite.T(), blog, "user_id")

		// Verify timestamp fields are present
		assert.Contains(suite.T(), blog, "created_at")
		assert.Contains(suite.T(), blog, "updated_at")
	}
}

// Test fetching blogs with title filter
func (suite *BlogTestSuite) TestBlogListWithTitleFilter() {
	blogs := []model.Blog{
		{Title: "First Blog Post", Post: "Content 1", UserID: suite.userID},
		{Title: "Second Blog Post", Post: "Content 2", UserID: suite.userID},
		{Title: "Different Title", Post: "Content 3", UserID: suite.userID},
	}

	for _, blog := range blogs {
		suite.db.Create(&blog)
	}

	req := httptest.NewRequest(http.MethodGet, "/blogs?title=Blog", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	blogsResult, _ := result["blogs"].([]interface{})
	assert.Equal(suite.T(), 2, len(blogsResult))
}

// Test fetching a blog successfully
func (suite *BlogTestSuite) TestBlogFetchSuccess() {
	// First create a blog to fetch
	blog := model.Blog{
		Title:  "Blog to Fetch",
		Post:   "This is the content to fetch",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	// Update the app to include the BlogFetch route
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "test@example.com")
		return c.Next()
	})
	app.Get("/blogs/:id", controller.BlogFetch)
	suite.app = app

	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodGet, url, nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Fetch Blog", result["msg"])

	blogResult, ok := result["blog"].(map[string]interface{})
	assert.True(suite.T(), ok)
	assert.Equal(suite.T(), "Blog to Fetch", blogResult["Title"])
	assert.Equal(suite.T(), "This is the content to fetch", blogResult["Post"])
	assert.Equal(suite.T(), float64(suite.userID), blogResult["user_id"])

	// Verify timestamp fields are present
	assert.Contains(suite.T(), blogResult, "created_at")
	assert.Contains(suite.T(), blogResult, "updated_at")
}

// Test fetching a blog when user is not authenticated
func (suite *BlogTestSuite) TestBlogFetchUnauthorized() {
	// Create a blog
	blog := model.Blog{
		Title:  "Blog to Fetch",
		Post:   "This is the content to fetch",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	// Set up app with no authentication
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		// Not setting userEmail simulates no authentication
		return c.Next()
	})
	app.Get("/blogs/:id", controller.BlogFetch)
	suite.app = app

	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodGet, url, nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Unauthorized", result["msg"])
}

// Test fetching a non-existent blog
func (suite *BlogTestSuite) TestBlogFetchNonExistent() {
	// Update the app to include the BlogFetch route
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "test@example.com")
		return c.Next()
	})
	app.Get("/blogs/:id", controller.BlogFetch)
	suite.app = app

	req := httptest.NewRequest(http.MethodGet, "/blogs/9999", nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Blog not found", result["msg"])
}

// Test fetching a blog with missing ID parameter
func (suite *BlogTestSuite) TestBlogFetchMissingIDParam() {
	// Update the app to include the BlogFetch route
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "test@example.com")
		return c.Next()
	})
	app.Get("/blogs/:id?", controller.BlogFetch) // Make ID optional for test
	suite.app = app

	req := httptest.NewRequest(http.MethodGet, "/blogs/", nil) // No ID
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Blog ID is required", result["msg"])
}

// Tests for BlogFetch function
// Test fetching another user's blog
func (suite *BlogTestSuite) TestBlogFetchOtherUserBlog() {
	// Create another user
	otherUser := model.User{
		Username: "otheruser",
		Email:    "other@example.com",
		Password: "hashed_password",
	}
	suite.db.Create(&otherUser)

	// Create a blog for the other user
	blog := model.Blog{
		Title:  "Other User Blog",
		Post:   "This belongs to another user",
		UserID: otherUser.ID,
	}
	suite.db.Create(&blog)

	// Update the app to include the BlogFetch route
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "test@example.com") // Current user
		return c.Next()
	})
	app.Get("/blogs/:id", controller.BlogFetch)
	suite.app = app

	// Try to fetch the other user's blog
	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodGet, url, nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Blog not found", result["msg"])
}

// Test fetching a blog with non-existent user
func (suite *BlogTestSuite) TestBlogFetchUserNotFound() {
	// Create a blog
	blog := model.Blog{
		Title:  "Blog to Fetch",
		Post:   "This is the content to fetch",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	// Update the app with non-existent user email
	app := fiber.New()
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "nonexistent@example.com")
		return c.Next()
	})
	app.Get("/blogs/:id", controller.BlogFetch)
	suite.app = app

	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodGet, url, nil)
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "User not found", result["msg"])
}

// Tests for BlogCreate function
// Test creating a blog successfully
func (suite *BlogTestSuite) TestBlogCreateSuccess() {
	blogData := map[string]interface{}{
		"title": "New Test Blog",
		"post":  "This is a test blog post content",
	}

	jsonData, _ := json.Marshal(blogData)
	req := httptest.NewRequest(http.MethodPost, "/blogs", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusCreated, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Blog created successfully", result["msg"])

	blog, ok := result["blog"].(map[string]interface{})
	assert.True(suite.T(), ok)
	assert.Equal(suite.T(), "New Test Blog", blog["Title"])
	assert.Equal(suite.T(), "This is a test blog post content", blog["Post"])

	// Verify created_at and updated_at are present
	assert.NotNil(suite.T(), blog["created_at"])
	assert.NotNil(suite.T(), blog["updated_at"])

	// Verify it was actually saved to the database
	var savedBlog model.Blog
	suite.db.Where("title = ?", "New Test Blog").First(&savedBlog)
	assert.Equal(suite.T(), "New Test Blog", savedBlog.Title)
	assert.Equal(suite.T(), suite.userID, savedBlog.UserID)
	assert.False(suite.T(), savedBlog.CreatedAt.IsZero())
	assert.False(suite.T(), savedBlog.UpdatedAt.IsZero())
}

// Test creating a blog when user is not authenticated
func (suite *BlogTestSuite) TestBlogCreateUnauthorized() {
	suite.token = ""
	blogData := map[string]interface{}{
		"title": "New Test Blog",
		"post":  "This is a test blog post content",
	}

	jsonData, _ := json.Marshal(blogData)
	req := httptest.NewRequest(http.MethodPost, "/blogs", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Unauthorized", result["msg"])
}

// Test creating a blog with invalid input
func (suite *BlogTestSuite) TestBlogCreateInvalidInput() {
	// Send malformed JSON
	req := httptest.NewRequest(http.MethodPost, "/blogs", bytes.NewBuffer([]byte("{invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Invalid input", result["msg"])
}

// Test creating a blog with non-existent user
func (suite *BlogTestSuite) TestBlogCreateUserNotFound() {
	suite.app = fiber.New()
	suite.app.Use(func(c *fiber.Ctx) error {
		c.Locals("userEmail", "nonexistent@example.com")
		return c.Next()
	})
	suite.app.Post("/blogs", controller.BlogCreate)

	blogData := map[string]interface{}{
		"title": "New Test Blog",
		"post":  "This is a test blog post content",
	}

	jsonData, _ := json.Marshal(blogData)
	req := httptest.NewRequest(http.MethodPost, "/blogs", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "User not found", result["msg"])
}

// Tests for BlogUpdate function

// Test updating a blog successfully
func (suite *BlogTestSuite) TestBlogUpdateSuccess() {
	// First create a blog to update
	blog := model.Blog{
		Title:  "Original Title",
		Post:   "Original Content",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	// Update data
	updateData := map[string]interface{}{
		"title": "Updated Title",
		"post":  "Updated Content",
	}

	jsonData, _ := json.Marshal(updateData)
	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Blog updated successfully", result["msg"])

	// Check that updated_at is updated
	blogResult, ok := result["blog"].(map[string]interface{})
	assert.True(suite.T(), ok)
	assert.NotNil(suite.T(), blogResult["updated_at"])

	// Verify update in database
	var updatedBlog model.Blog
	suite.db.First(&updatedBlog, blog.ID)
	assert.Equal(suite.T(), "Updated Title", updatedBlog.Title)
	assert.Equal(suite.T(), "Updated Content", updatedBlog.Post)

	// Verify timestamps
	assert.False(suite.T(), updatedBlog.CreatedAt.IsZero())
	assert.False(suite.T(), updatedBlog.UpdatedAt.IsZero())
	// Updated time should be after created time
	assert.True(suite.T(), updatedBlog.UpdatedAt.After(updatedBlog.CreatedAt) ||
		updatedBlog.UpdatedAt.Equal(updatedBlog.CreatedAt))
}

// Test updating a non-existent blog
func (suite *BlogTestSuite) TestBlogUpdateNonExistent() {
	updateData := map[string]interface{}{
		"title": "Updated Title",
		"post":  "Updated Content",
	}

	jsonData, _ := json.Marshal(updateData)
	req := httptest.NewRequest(http.MethodPut, "/blogs/9999", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Could not fetch blog", result["msg"])
}

// Test updating a blog with invalid input
func (suite *BlogTestSuite) TestBlogUpdateInvalidInput() {
	// First create a blog to update
	blog := model.Blog{
		Title:  "Original Title",
		Post:   "Original Content",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	// Send malformed JSON
	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodPut, url, bytes.NewBuffer([]byte("{invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Invalid input", result["msg"])
}

// Test updating another user's blog
func (suite *BlogTestSuite) TestBlogUpdateOtherUserBlog() {
	// Create another user
	otherUser := model.User{
		Username: "otheruser",
		Email:    "other@example.com",
		Password: "hashed_password",
	}
	suite.db.Create(&otherUser)

	// Create a blog for the other user
	blog := model.Blog{
		Title:  "Other User Blog",
		Post:   "This belongs to another user",
		UserID: otherUser.ID,
	}
	suite.db.Create(&blog)

	// Try to update the other user's blog
	updateData := map[string]interface{}{
		"title": "Attempted Update",
		"post":  "Trying to update another user's blog",
	}

	jsonData, _ := json.Marshal(updateData)
	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodPut, url, bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Could not fetch blog", result["msg"])

	// Verify that the blog remains unchanged
	var unchangedBlog model.Blog
	suite.db.First(&unchangedBlog, blog.ID)
	assert.Equal(suite.T(), "Other User Blog", unchangedBlog.Title)
}

// Tests for BlogDelete function

// Test deleting a blog successfully
func (suite *BlogTestSuite) TestBlogDeleteSuccess() {
	// First create a blog to delete
	blog := model.Blog{
		Title:  "Blog to Delete",
		Post:   "This will be deleted",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodDelete, url, nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "OK", result["statusText"])
	assert.Equal(suite.T(), "Blog deleted successfully", result["msg"])

	// Verify blog was deleted
	var count int64
	suite.db.Model(&model.Blog{}).Where("id = ?", blog.ID).Count(&count)
	assert.Equal(suite.T(), int64(0), count)
}

// Test deleting a non-existent blog
func (suite *BlogTestSuite) TestBlogDeleteNonExistent() {
	req := httptest.NewRequest(http.MethodDelete, "/blogs/9999", nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Could not fetch blog", result["msg"])
}

// Test deleting another user's blog
func (suite *BlogTestSuite) TestBlogDeleteOtherUserBlog() {
	// Create another user
	otherUser := model.User{
		Username: "otheruser",
		Email:    "other@example.com",
		Password: "hashed_password",
	}
	suite.db.Create(&otherUser)

	// Create a blog for the other user
	blog := model.Blog{
		Title:  "Other User Blog",
		Post:   "This belongs to another user",
		UserID: otherUser.ID,
	}
	suite.db.Create(&blog)

	// Try to delete the other user's blog
	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodDelete, url, nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Could not fetch blog", result["msg"])

	// Verify that the blog still exists
	var count int64
	suite.db.Model(&model.Blog{}).Where("id = ?", blog.ID).Count(&count)
	assert.Equal(suite.T(), int64(1), count)
}

// Test deleting a blog when user is not authenticated
func (suite *BlogTestSuite) TestBlogDeleteUnauthorized() {
	suite.token = ""
	// First create a blog
	blog := model.Blog{
		Title:  "Blog to Delete",
		Post:   "This will be attempted to delete",
		UserID: suite.userID,
	}
	suite.db.Create(&blog)

	url := fmt.Sprintf("/blogs/%d", blog.ID)
	req := httptest.NewRequest(http.MethodDelete, url, nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Unauthorized", result["msg"])

	// Verify blog still exists
	var count int64
	suite.db.Model(&model.Blog{}).Where("id = ?", blog.ID).Count(&count)
	assert.Equal(suite.T(), int64(1), count)
}

// Run the test suite
func TestBlogSuite(t *testing.T) {
	suite.Run(t, new(BlogTestSuite))
}
