package database

import (
	"log"
	models "polyprep/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := "host=postgres user=postgres password=Md_rzy3dBdKmAMYZC2a_ dbname=bd port=5432 sslmode=disable"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	db.AutoMigrate(&models.Post{}, &models.Include{}, &models.Like{}, &models.Comment{}, &models.User{})

	DB = db
}
