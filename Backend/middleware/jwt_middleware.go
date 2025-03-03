package middleware

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

const SecretKey = "your_secret_key"

func JWTMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")

		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"statusText": "error",
				"msg":        "Missing or invalid token",
			})
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(SecretKey), nil
		})

		if err != nil || !token.Valid {
			log.Println("Invalid token:", err)
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"statusText": "error",
				"msg":        "Unauthorized",
			})
		}
		// Extract user email from token claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"statusText": "error",
				"msg":        "Invalid token claims",
			})
		}

		email, ok := claims["email"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"statusText": "error",
				"msg":        "Email not found in token",
			})
		}

		// Store email in request context
		c.Locals("userEmail", email)

		log.Println("Authenticated user email:", email) // Debugging log
		return c.Next()

	}
}
