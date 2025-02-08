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

	if err := c.BodyParser(&user_record); err != nil {
		log.Println("Error in parsing user record")
		context["statusText"] = "error"
		context["msg"] = "Error in parsing user record"
	}
	result := database.DBConn.Create(user_record)

	if result.Error != nil {
		log.Println("Error while saving user data to db")
		context["statusText"] = "error"
		context["msg"] = "Error while saving user data to db"
	}
	context["msg"] = "User record saved successfully"
	context["data"] = user_record
	c.Status(201)
	return c.JSON(context)
}

func SignUp(c *fiber.Ctx) error {
	context := fiber.Map{
		"statusText": "OK",
		"msg":        "SignUp user",
	}

	user_record := new(model.User)

	if err := c.BodyParser(&user_record); err != nil {
		log.Println("Error in parsing user record")
		context["statusText"] = "error"
		context["msg"] = "Error in parsing user record"
	}
	result := database.DBConn.Create(user_record)

	if result.Error != nil {
		log.Println(result.Error)
		context["statusText"] = "error"
		context["msg"] = "Error while saving user data to db"
	}
	context["msg"] = "User record saved successfully"
	context["data"] = user_record
	c.Status(201)
	return c.JSON(context)
}
