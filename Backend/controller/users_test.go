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

type AuthTestSuite struct {
	suite.Suite
	app    *fiber.App
	db     *gorm.DB
	userID uint
}

func (suite *AuthTestSuite) SetupTest() {

	db, err := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		suite.T().Fatal("Failed to connect to test database:", err)
	}

	db.AutoMigrate(&model.User{}, &model.Blog{})

	database.DBConn = db
	suite.db = db

	app := fiber.New()

	app.Post("/auth/signup", controller.SignUp)
	app.Post("/auth/signin", controller.SignIn)

	app.Post("/auth/request-reset", controller.RequestResetCode)
	app.Post("/auth/verify-code", controller.VerifyResetCode)
	app.Post("/auth/reset-password", controller.ResetPasswordWithEmail)

	suite.app = app
}

func (suite *AuthTestSuite) TearDownTest() {

	sqlDB, _ := suite.db.DB()
	sqlDB.Close()
}

func (suite *AuthTestSuite) TestSignUpSuccess() {

	user := map[string]interface{}{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusCreated, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "User registered successfully", result["msg"])
	assert.NotNil(suite.T(), result["token"])

	var savedUser model.User
	suite.db.Where("email = ?", "test@example.com").First(&savedUser)
	assert.Equal(suite.T(), "testuser", savedUser.Username)
	suite.userID = savedUser.ID
}

func (suite *AuthTestSuite) TestSignUpDuplicateEmail() {

	suite.TestSignUpSuccess()

	user := map[string]interface{}{
		"username": "anothertestuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Email already registered", result["msg"])
}

func (suite *AuthTestSuite) TestSignUpDuplicateUsername() {

	suite.TestSignUpSuccess()

	user := map[string]interface{}{
		"username": "testuser",
		"email":    "another@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Username is already taken", result["msg"])
}

func (suite *AuthTestSuite) TestSignUpInvalidJSON() {

	invalidJSON := []byte(`{"username": "testuser", "email": "test@example.com", "password":}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Invalid input", result["msg"])
}

func (suite *AuthTestSuite) TestSignInSuccess() {

	suite.TestSignUpSuccess()

	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Login successful", result["msg"])
	assert.NotNil(suite.T(), result["token"])
}

func (suite *AuthTestSuite) TestSignInUserNotFound() {

	credentials := map[string]interface{}{
		"email":    "nonexistent@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "User not found", result["msg"])
}

func (suite *AuthTestSuite) TestSignInIncorrectPassword() {

	suite.TestSignUpSuccess()

	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "wrongpassword",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Incorrect password", result["msg"])
}

func (suite *AuthTestSuite) TestSignInInvalidJSON() {

	invalidJSON := []byte(`{"email": "test@example.com", "password":}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode) // Note: Your API returns 200 even for errors

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Invalid input", result["msg"])
}

func (suite *AuthTestSuite) TestSignInMissingFields() {

	credentials := map[string]interface{}{
		"password": "password123",
	}

	jsonData, _ := json.Marshal(credentials)
	req := httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := suite.app.Test(req)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])

	credentials = map[string]interface{}{
		"email": "test@example.com",
	}

	jsonData, _ = json.Marshal(credentials)
	req = httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ = suite.app.Test(req)

	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(suite.T(), "error", result["statusText"])
}

func (suite *AuthTestSuite) TestJWTTokenValidation() {

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

	parsedToken, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {

		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(controller.SecretKey), nil
	})

	assert.Nil(suite.T(), err)
	assert.True(suite.T(), parsedToken.Valid)

	if claims, ok := parsedToken.Claims.(jwt.MapClaims); ok && parsedToken.Valid {
		assert.Equal(suite.T(), "test@example.com", claims["email"])

		assert.Greater(suite.T(), claims["exp"].(float64), float64(time.Now().Unix()))
	} else {
		suite.T().Errorf("Failed to parse token claims")
	}
}

func (suite *AuthTestSuite) TestMalformedContentType() {
	user := map[string]interface{}{
		"username": "testuser",
		"email":    "test@example.com",
		"password": "password123",
	}

	jsonData, _ := json.Marshal(user)
	req := httptest.NewRequest(http.MethodPost, "/auth/signup", bytes.NewReader(jsonData))

	req.Header.Set("Content-Type", "text/plain")

	resp, _ := suite.app.Test(req)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "error", result["statusText"])
}

func (suite *AuthTestSuite) TestDatabaseErrorHandling() {

	tx := suite.db.Begin()
	originalDB := database.DBConn
	database.DBConn = tx

	tx.Rollback()

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

	assert.Equal(suite.T(), "error", result["statusText"])

	database.DBConn = originalDB
}

func (suite *AuthTestSuite) TestRequestResetCodeUserNotFound() {
	requestBody := map[string]interface{}{
		"email": "nonexistent@example.com",
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/request-reset", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "User not found", result["msg"])
}

func (suite *AuthTestSuite) TestRequestResetCodeInvalidJSON() {
	invalidJSON := []byte(`{"email":}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/request-reset", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Invalid request", result["msg"])
}

func (suite *AuthTestSuite) TestVerifyResetCodeSuccess() {
	// First create a user and request a reset code
	suite.TestSignUpSuccess()

	// Manually set a reset code
	var user model.User
	suite.db.Where("email = ?", "test@example.com").First(&user)

	resetCode := "123456"
	user.ResetCode = resetCode
	user.ResetCodeExpiry = time.Now().Add(10 * time.Minute)
	suite.db.Save(&user)

	// Verify the reset code
	requestBody := map[string]interface{}{
		"email": "test@example.com",
		"code":  resetCode,
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/verify-code", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Code verified. Proceed to reset password.", result["msg"])

	// Check that the reset code was cleared
	suite.db.Where("email = ?", "test@example.com").First(&user)
	assert.Empty(suite.T(), user.ResetCode)
}

func (suite *AuthTestSuite) TestVerifyResetCodeInvalid() {
	// First create a user and request a reset code
	suite.TestSignUpSuccess()

	// Manually set a reset code
	var user model.User
	suite.db.Where("email = ?", "test@example.com").First(&user)

	resetCode := "123456"
	user.ResetCode = resetCode
	user.ResetCodeExpiry = time.Now().Add(10 * time.Minute)
	suite.db.Save(&user)

	// Try to verify with wrong code
	requestBody := map[string]interface{}{
		"email": "test@example.com",
		"code":  "654321", // Wrong code
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/verify-code", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusUnauthorized, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Invalid or expired code", result["msg"])
}

func (suite *AuthTestSuite) TestVerifyResetCodeExpired() {
	// First create a user and request a reset code
	suite.TestSignUpSuccess()

	// Manually set an expired reset code
	var user model.User
	suite.db.Where("email = ?", "test@example.com").First(&user)

	resetCode := "123456"
	user.ResetCode = resetCode
	user.ResetCodeExpiry = time.Now().Add(-10 * time.Minute) // Expired 10 minutes ago
	suite.db.Save(&user)

	// Try to verify with expired code
	requestBody := map[string]interface{}{
		"email": "test@example.com",
		"code":  resetCode,
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/verify-code", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusUnauthorized, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Invalid or expired code", result["msg"])
}

func (suite *AuthTestSuite) TestVerifyResetCodeUserNotFound() {
	requestBody := map[string]interface{}{
		"email": "nonexistent@example.com",
		"code":  "123456",
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/verify-code", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "User not found", result["msg"])
}

func (suite *AuthTestSuite) TestVerifyResetCodeInvalidJSON() {
	invalidJSON := []byte(`{"email": "test@example.com", "code":}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/verify-code", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Invalid request", result["msg"])
}

func (suite *AuthTestSuite) TestResetPasswordSuccess() {
	// First create a user
	suite.TestSignUpSuccess()

	// Reset password request
	requestBody := map[string]interface{}{
		"email":        "test@example.com",
		"new_password": "newpassword123",
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Password updated successfully", result["msg"])

	// Verify that we can sign in with the new password
	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "newpassword123",
	}

	jsonData, _ = json.Marshal(credentials)
	req = httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err = suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(suite.T(), "Login successful", result["msg"])
}

func (suite *AuthTestSuite) TestResetPasswordUserNotFound() {
	requestBody := map[string]interface{}{
		"email":        "nonexistent@example.com",
		"new_password": "newpassword123",
	}

	jsonData, _ := json.Marshal(requestBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusNotFound, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "User not found", result["msg"])
}

func (suite *AuthTestSuite) TestResetPasswordInvalidJSON() {
	invalidJSON := []byte(`{"email": "test@example.com", "new_password":}`)
	req := httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewReader(invalidJSON))
	req.Header.Set("Content-Type", "application/json")

	resp, err := suite.app.Test(req)

	assert.Nil(suite.T(), err)
	assert.Equal(suite.T(), http.StatusBadRequest, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)

	assert.Equal(suite.T(), "Invalid request", result["msg"])
}

func (suite *AuthTestSuite) TestResetPasswordFlow() {
	// First create a user
	suite.TestSignUpSuccess()

	// Step 1: Request reset code
	var user model.User
	suite.db.Where("email = ?", "test@example.com").First(&user)

	resetCode := "123456"
	user.ResetCode = resetCode
	user.ResetCodeExpiry = time.Now().Add(10 * time.Minute)
	suite.db.Save(&user)

	// Step 2: Verify reset code
	verifyBody := map[string]interface{}{
		"email": "test@example.com",
		"code":  resetCode,
	}

	jsonData, _ := json.Marshal(verifyBody)
	req := httptest.NewRequest(http.MethodPost, "/auth/verify-code", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ := suite.app.Test(req)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	// Step 3: Reset password
	resetBody := map[string]interface{}{
		"email":        "test@example.com",
		"new_password": "newpassword123",
	}

	jsonData, _ = json.Marshal(resetBody)
	req = httptest.NewRequest(http.MethodPost, "/auth/reset-password", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ = suite.app.Test(req)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	// Step 4: Verify can sign in with new password
	credentials := map[string]interface{}{
		"email":    "test@example.com",
		"password": "newpassword123",
	}

	jsonData, _ = json.Marshal(credentials)
	req = httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ = suite.app.Test(req)
	assert.Equal(suite.T(), http.StatusOK, resp.StatusCode)

	var result map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(suite.T(), "Login successful", result["msg"])

	// Step 5: Verify old password no longer works
	credentials = map[string]interface{}{
		"email":    "test@example.com",
		"password": "password123", // Original password
	}

	jsonData, _ = json.Marshal(credentials)
	req = httptest.NewRequest(http.MethodPost, "/auth/signin", bytes.NewReader(jsonData))
	req.Header.Set("Content-Type", "application/json")

	resp, _ = suite.app.Test(req)

	json.NewDecoder(resp.Body).Decode(&result)
	assert.Equal(suite.T(), "error", result["statusText"])
	assert.Equal(suite.T(), "Incorrect password", result["msg"])
}

func TestAuthSuite(t *testing.T) {
	suite.Run(t, new(AuthTestSuite))
}
