package controller_test

import (
	"Gator_blog/controller"
	"Gator_blog/database"
	"Gator_blog/model"
	"encoding/json"
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

	app.Get("/blogs", controller.BlogList)
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
	}
}

// Run the test suite
func TestBlogSuite(t *testing.T) {
	suite.Run(t, new(BlogTestSuite))
}
