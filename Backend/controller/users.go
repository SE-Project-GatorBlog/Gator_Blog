package controller

import (
	"Gator_blog/database"
	"Gator_blog/model"
	"log"

	"github.com/gofiber/fiber/v2"
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

	// Compare the entered password with stored password
	if existingUser.Password != user_record.Password {
		log.Println("Incorrect password")
		context["statusText"] = "error"
		context["msg"] = "Incorrect password"
		return c.JSON(context)
	}

	context["msg"] = "User record fetched successfully"
	context["data"] = existingUser
	c.Status(201)
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

	result := database.DBConn.Create(user_record)

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
