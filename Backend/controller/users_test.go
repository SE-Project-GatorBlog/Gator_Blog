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
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// Define the test suite
type AuthTestSuite struct {
	suite.Suite
	app    *fiber.App
	db     *gorm.DB
	userID uint
}

// Setup before each test
func (suite *AuthTestSuite) SetupTest() {
	// Create an in-memory SQLite database for testing
	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		suite.T().Fatal("Failed to connect to test database:", err)
	}

	// Auto migrate the models
	db.AutoMigrate(&model.User{}, &model.Blog{})

	// Set the global database connection
	database.DBConn = db
	suite.db = db

	// Create a new Fiber app
	app := fiber.New()

	// Register the auth routes
	app.Post("/auth/signup", controller.SignUp)
	app.Post("/auth/signin", controller.SignIn)

	suite.app = app
}

// Cleanup after each test
func (suite *AuthTestSuite) TearDownTest() {
	// Clean up the database
	sqlDB, _ := suite.db.DB()
	sqlDB.Close()
}

// Test SignUp with valid user data
func (suite *AuthTestSuite) TestSignUpSuccess() {
	// Prepare the request
	user := map[string]interface{}{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusCreated, resp.StatusCode)

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "User registered successfully", result["msg"])
	assert.NotNil(suite.T(), result["token"])

	// Verify the user was saved in the database
	var savedUser model.User
	suite.db.Where("email = ?", "test@example.com").First(&savedUser)
	assert.Equal(suite.T(), "testuser", savedUser.Username)
	suite.userID = savedUser.ID
}

// Test SignUp with duplicate email
func (suite *AuthTestSuite) TestSignUpDuplicateEmail() {
	// Create a user first
	suite.TestSignUpSuccess()

	// Try to sign up with the same email
	user := map[string]interface{}{
		"username": "anothertestuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Email already registered", result["msg"])
}

// Test SignUp with duplicate username
func (suite *AuthTestSuite) TestSignUpDuplicateUsername() {
	// Create a user first
	suite.TestSignUpSuccess()

	// Try to sign up with the same username but different email
	user := map[string]interface{}{
		"username": "testuser",
		"email":    "another@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Username is already taken", result["msg"])
}

// Test SignUp with invalid JSON
func (suite *AuthTestSuite) TestSignUpInvalidJSON() {
	// Prepare request with invalid JSON
	invalidJSON := []byte({"username": "testuser", "email": "test@example.com", "password":})
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Invalid input", result["msg"])
}

// Test SignIn with valid credentials
func (suite *AuthTestSuite) TestSignInSuccess() {
	// Create a user first
	suite.TestSignUpSuccess()

	// Prepare the signin request
	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "Login successful", result["msg"])
	assert.NotNil(suite.T(), result["token"])
}

// Test SignIn with non-existent user
func (suite *AuthTestSuite) TestSignInUserNotFound() {
	// Prepare the signin request with non-existent email
	credentials := map[string]interface{}{
		"email":    "nonexistent@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "User not found", result["msg"])
}

// Test SignIn with incorrect password
func (suite *AuthTestSuite) TestSignInIncorrectPassword() {
	// Create a user first
	suite.TestSignUpSuccess()

	// Prepare the signin request with wrong password
	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "wrongpassword",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Incorrect password", result["msg"])
}

// Test SignIn with invalid JSON
func (suite *AuthTestSuite) TestSignInInvalidJSON() {
	// Prepare request with invalid JSON
	invalidJSON := []byte({"email": "test@example.com", "password":})
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	// Execute the request
	resp, err := suite.app.Test(req)

	// Assert
	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	// Parse response
	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Verify the response
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Invalid input", result["msg"])
}

// Test SignIn with missing fields
func (suite *AuthTestSuite) TestSignInMissingFields() {
	// Test with missing email
	credentials := map[string]interface{}{
		"password": "password123",
		// email is missing
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := suite.app.Test(req)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])

	// Test with missing password
	credentials = map[string]interface{}{
		"email": "test@example.com",
		// password is missing
	}

	jsonData, _ = json.Marshal(credentials)
	req = httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ = suite.app.Test(req)

	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(suite.T(), "error", result["statusText"])
}

// Test JWT token validation
func (suite *AuthTestSuite) TestJWTTokenValidation() {
	// First create a user and get a token
	suite.TestSignUpSuccess()

	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := suite.app.Test(req)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	token := result["token"].(string)

	// Now verify that the token is valid and contains the correct claims
	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		// Validate the alg is what we expect
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(controller.SecretKey), nil
	})

	assert.Nil(suite.T(), err)
	assert.True(suite.T(), parsedToken.Valid)

	// Check that the claims are what we expect
	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		assert.Equal(suite.T(), "test@example.com", claims["email"])
		// Check that the expiration time is in the future
		assert.Greater(suite.T(), claims["exp"].(float64), float64(time.Now().Unix()))
	} else {
		suite.T().Errorf("Failed to parse token claims")
	}
}

// Test with malformed content type
func (suite *AuthTestSuite) TestMalformedContentType() {
	user := map[string]interface{}{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	// Set incorrect content type
	req.Header.Set("Content-Type", "text/plain")

	resp, _ := suite.app.Test(req)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
}

// Mock database error scenarios
func (suite *AuthTestSuite) TestDatabaseErrorHandling() {
	// Create a transaction and roll it back to simulate a database error
	tx := suite.db.Begin()
	originalDB := database.DBConn
	database.DBConn = tx

	// Rollback immediately to cause any future operations to fail
	tx.Rollback()

	// Try to sign up with the rolled back transaction
	user := map[string]interface{}{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := suite.app.Test(req)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	// Check that the error was handled properly
	assert.Equal(suite.T(), "error", result["statusText"])

	// Restore the original database connection
	database.DBConn = originalDB
}

// Run the test suite
func TestAuthSuite(t *testing.T) {
	suite.Run(t, new(AuthTestSuite))
}