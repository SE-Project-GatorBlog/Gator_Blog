package database

import (
	"Gator_blog/model"
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DBConn *gorm.DB

func ConnectDB() {

	dsn := "root:Saranya!132@tcp(localhost:3306)/gator_blog_db?charset=utf8mb4&parseTime=True&loc=Local"

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})

	if err != nil {
		panic("Database connection failed")
	}
	log.Println("DB Connection successful")
	db.AutoMigrate(new(model.User))
	db.AutoMigrate(new(model.Blog))
	

	DBConn = db
}
