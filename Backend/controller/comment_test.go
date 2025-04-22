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

// Define the test suite for the Comment API
type CommentTestSuite struct {
	suite.Suite
	app    *fiber.App
	db     *gorm.DB
	userID uint
	blogID uint
}

// Setup before each test
func (suite *CommentTestSuite) SetupTest() {
	// Create an in-memory SQLite database for testing
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		suite.T().Fatal("Failed to connect to test database:", err)
	}
	db.AutoMigrate(&model.User{}, &model.Blog{}, &model.Comment{})
	database.DBConn = db
	suite.db = db

	app := fiber.New()

	// Setup routes
	app.Post("/comments", controller.AddComment)
	app.Get("/blogs/:id/comments", controller.GetCommentsByBlogID)

	suite.app = app

	// Create a test user
	user := model.User{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "hashed_password",
	}
	suite.db.Create(&user)
	suite.userID = user.ID

	// Create a test blog
	blog := model.Blog{
		Title:  "Test Blog",
		Post:   "This is test content",
		UserID: user.ID,
	}
	suite.db.Create(&blog)
	suite.blogID = blog.ID
}

// Cleanup after each test
func (suite *CommentTestSuite) TearDownTest() {
	sqlDB, _ := suite.db.DB()
	sqlDB.Close()
}

// Test adding a comment successfully
func (suite *CommentTestSuite) TestAddCommentSuccess() {
	// The original test was using map with "UserID" and "BlogID", but the model likely expects "user_id" and "blog_id"
	// Let's modify how we're sending the data to match what the controller expects
	commentData := map[string]interface{}{
		"user_id": suite.userID,
		"blog_id": suite.blogID,
		"content": "This is a test comment",
	}

	jsonData, _ := json.Marshal(commentData)
	req := httptest.NewRequest(http.MethodPost, "/comments", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusCreated, resp.StatusCode)

	var result model.Comment
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), suite.userID, result.UserID)
	assert.Equal(suite.T(), suite.blogID, result.BlogID)
	assert.Equal(suite.T(), "This is a test comment", result.Content)
	assert.NotZero(suite.T(), result.ID)

	// Verify it was saved to the database
	var savedComment model.Comment
	suite.db.First(&savedComment, result.ID)
	assert.Equal(suite.T(), "This is a test comment", savedComment.Content)
}

// Test adding a comment with invalid input
func (suite *CommentTestSuite) TestAddCommentInvalidInput() {
	// Send malformed JSON
	req := httptest.NewRequest(http.MethodPost, "/comments", bytes.NewBuffer([]byte("{invalid json")))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Invalid input", result["error"])
}

// Test adding a comment with missing required fields
func (suite *CommentTestSuite) TestAddCommentMissingFields() {
	// Missing UserID and BlogID
	commentData := map[string]interface{}{
		"content": "Incomplete comment data",
	}

	jsonData, _ := json.Marshal(commentData)
	req := httptest.NewRequest(http.MethodPost, "/comments", bytes.NewBuffer(jsonData))
	req.Header.Set("Content-Type", "application/json")
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusCreated, resp.StatusCode)

	var result model.Comment
	json.NewDecoder(resp.Body).Decode(&result)

	// UserID and BlogID should be zero values
	assert.Zero(suite.T(), result.UserID)
	assert.Zero(suite.T(), result.BlogID)
	assert.Equal(suite.T(), "Incomplete comment data", result.Content)
}

// Test getting comments by blog ID when comments exist
func (suite *CommentTestSuite) TestGetCommentsByBlogIDWithComments() {
	// Add test comments
	comments := []model.Comment{
		{UserID: suite.userID, BlogID: suite.blogID, Content: "First comment"},
		{UserID: suite.userID, BlogID: suite.blogID, Content: "Second comment"},
		{UserID: suite.userID, BlogID: suite.blogID, Content: "Third comment"},
	}

	for _, comment := range comments {
		suite.db.Create(&comment)
	}

	// Create another blog and add a comment to it
	otherBlog := model.Blog{Title: "Other Blog", Post: "Other content", UserID: suite.userID}
	suite.db.Create(&otherBlog)

	otherComment := model.Comment{UserID: suite.userID, BlogID: otherBlog.ID, Content: "Comment on other blog"}
	suite.db.Create(&otherComment)

	url := fmt.Sprintf("/blogs/%d/comments", suite.blogID)
	req := httptest.NewRequest(http.MethodGet, url, nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result []model.Comment
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), 3, len(result))
	assert.Equal(suite.T(), "First comment", result[0].Content)
	assert.Equal(suite.T(), "Second comment", result[1].Content)
	assert.Equal(suite.T(), "Third comment", result[2].Content)
}

// Test getting comments by blog ID when no comments exist
func (suite *CommentTestSuite) TestGetCommentsByBlogIDNoComments() {
	url := fmt.Sprintf("/blogs/%d/comments", suite.blogID)
	req := httptest.NewRequest(http.MethodGet, url, nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result []model.Comment
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), 0, len(result))
	assert.Empty(suite.T(), result)
}

// Test getting comments for non-existent blog
func (suite *CommentTestSuite) TestGetCommentsByNonExistentBlogID() {
	req := httptest.NewRequest(http.MethodGet, "/blogs/9999/comments", nil)
	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result []model.Comment
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), 0, len(result))
	assert.Empty(suite.T(), result)
}

// Run the test suite
func TestCommentSuite(t *testing.T) {
	suite.Run(t, new(CommentTestSuite))
}