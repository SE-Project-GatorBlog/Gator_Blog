package model

import "time"

type Blog struct {
	ID        uint      `json: "id" gorm:"primaryKey"`
	Title     string    `json: "title" gorm:"not null;column:title;size:255"`
	Post      string    `json: "post" gorm:"not null;column:post;size:255"`
	UserID    uint      `json:"user_id" gorm:"not null;index"` // Foreign key
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}
