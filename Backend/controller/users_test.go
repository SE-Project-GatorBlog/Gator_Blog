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

func TestAuthSuite(t *testing.T) {
	suite.Run(t, new(AuthTestSuite))
}
