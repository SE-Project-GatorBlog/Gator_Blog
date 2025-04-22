package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"
	"Gator_blog/utils"
	"fmt"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/exp/rand"
)

const SecretKey = "your_secret_key"

// Function to generate JWT token
func generateJWT(email string) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(SecretKey))
}

// SignIn function
func SignIn(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "SignIn user",
	}

	user_record := new(model.User)

	// Parse the user input from the request
	if err := c.BodyParser(&user_record); err != nil {
		log.Println("Error parsing user record")
		context["statusText"] = "error"
		context["msg"] = "Invalid input"
		return c.JSON(context)
	}

	// Check if the user exists in the database
	var existingUser model.User
	result := database.DBConn.Where("email = ?", user_record.Email).First(&existingUser)

	if result.Error != nil {
		log.Println("User not found")
		context["statusText"] = "error"
		context["msg"] = "User not found"
		return c.JSON(context)
	}
	// Compare the entered password with the stored hashed password
	err := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(user_record.Password))
	if err != nil {
		log.Println("Incorrect password")
		context["statusText"] = "error"
		context["msg"] = "Incorrect password"
		return c.JSON(context)
	}

	// Generate JWT token
	token, err := generateJWT(existingUser.Email)
	if err != nil {
		log.Println("Error generating token", err)
		context["statusText"] = "error"
		context["msg"] = "Error generating token"
		return c.JSON(context)
	}
	println()
	context["msg"] = "Login successful"
	context["token"] = token

	// new change Sritha - start
	context["username"] = existingUser.Username
	context["email"] = existingUser.Email
	// new change Sritha - end

	c.Status(200)
	return c.JSON(context)
}

// SignUp function
func SignUp(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "SignUp user",
	}

	user_record := new(model.User)

	// Parse the user input from the request
	if err := c.BodyParser(&user_record); err != nil {
		log.Println("Error in parsing user record")
		context["statusText"] = "error"
		context["msg"] = "Invalid input"
		return c.JSON(context)
	}

	// Check if the email and username already exists in the database
	var existingUser model.User
	result := database.DBConn.Where("email = ?", user_record.Email).First(&existingUser)

	if result.Error == nil {
		log.Println("Email already exists")
		context["statusText"] = "error"
		context["msg"] = "Email already registered"
		return c.JSON(context)
	}
	result = database.DBConn.Where("username = ?", user_record.Username).First(&existingUser)

	if result.Error == nil {
		log.Println("Username already exists")
		context["statusText"] = "error"
		context["msg"] = "Username is already taken"
		return c.JSON(context)
	}

	// Hash the password before saving it to the database
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user_record.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Println("Error while hashing password", err)
		context["statusText"] = "error"
		context["msg"] = "Error hashing password"
		return c.JSON(context)
	}

	// Update the user_record with the hashed password
	user_record.Password = string(hashedPassword)
	user_record.ResetCodeExpiry = time.Now()
	// If email does not exist, proceed to create the new user
	result = database.DBConn.Create(user_record)

	if result.Error != nil {
		log.Println("Error saving user to db")
		context["statusText"] = "error"
		context["msg"] = "Error saving user to db"
		return c.JSON(context)
	}

	// Generate JWT token
	token, err := generateJWT(user_record.Email)
	if err != nil {
		log.Println("Error generating token", err)
		context["statusText"] = "error"
		context["msg"] = "Error generating token"
		return c.JSON(context)
	}

	context["msg"] = "User registered successfully"
	context["token"] = token
	c.Status(201)
	return c.JSON(context)
}

func RequestResetCode(c *fiber.Ctx) error {
	type Request struct {
		Email string `json:"email"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"msg": "Invalid request"})
	}

	var user model.User
	result := database.DBConn.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"msg": "User not found"})
	}

	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	user.ResetCode = code
	user.ResetCodeExpiry = time.Now().Add(10 * time.Minute)

	database.DBConn.Save(&user)

	err := utils.SendResetCodeEmail(user.Email, code)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"msg": "Failed to send email"})
	}

	return c.JSON(fiber.Map{"msg": "Verification code sent"})
}

func VerifyResetCode(c *fiber.Ctx) error {
	type Request struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"msg": "Invalid request"})
	}

	var user model.User
	result := database.DBConn.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"msg": "User not found"})
	}
	if user.ResetCode != req.Code || time.Now().After(user.ResetCodeExpiry) {
		return c.Status(401).JSON(fiber.Map{"msg": "Invalid or expired code"})
	}

	// Clear the reset code after successful verification
	user.ResetCode = ""
	database.DBConn.Save(&user)

	return c.JSON(fiber.Map{"msg": "Code verified. Proceed to reset password."})
}

func ResetPasswordWithEmail(c *fiber.Ctx) error {
	type Request struct {
		Email       string `json:"email"`
		NewPassword string `json:"new_password"`
	}
	var req Request
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"msg": "Invalid request"})
	}

	var user model.User
	result := database.DBConn.Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"msg": "User not found"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"msg": "Error hashing password"})
	}

	user.Password = string(hashedPassword)
	database.DBConn.Save(&user)

	return c.JSON(fiber.Map{"msg": "Password updated successfully"})
}
