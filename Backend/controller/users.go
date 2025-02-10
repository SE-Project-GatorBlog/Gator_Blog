package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"
	"log"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

func SignIn(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "SignIn user",
	}

	user_record := new(model.User)

	// Parse the user input from the request
	if err := c.BodyParser(&user_record); err != nil {
		log.Println("Error in parsing user record")
		context["statusText"] = "error"
		context["msg"] = "Error in parsing user record"
		return c.JSON(context)
	}

	// Check if the user exists in the database
	var existingUser model.User
	result := database.DBConn.Where("email = ?", user_record.Email).First(&existingUser)

	if result.Error != nil {
		log.Println("Error while fetching user data from db or user not found")
		context["statusText"] = "error"
		context["msg"] = "Error while saving user data to db"
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

	context["msg"] = "User record fetched successfully"
	context["data"] = existingUser
	c.Status(200)
	return c.JSON(context)
}

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
		context["msg"] = "Error in parsing user record"
		return c.JSON(context)
	}

	// Check if the email and username already exists in the database
	var existingUser model.User
	result := database.DBConn.Where("email = ?", user_record.Email).First(&existingUser)

	if result.Error == nil {
		// If user exists with the same email, return an error
		log.Println("Email already exists")
		context["statusText"] = "error"
		context["msg"] = "Email is already registered"
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
		context["msg"] = "Error while hashing password"
		return c.JSON(context)
	}

	// Update the user_record with the hashed password
	user_record.Password = string(hashedPassword)
	// If email does not exist, proceed to create the new user
	result = database.DBConn.Create(user_record)

	if result.Error != nil {
		log.Println(result.Error)
		context["statusText"] = "error"
		context["msg"] = "Error while saving user data to db"
		return c.JSON(context)
	}
	context["msg"] = "User record saved successfully"
	context["data"] = user_record
	c.Status(201)
	return c.JSON(context)
}
