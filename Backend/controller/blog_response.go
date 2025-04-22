package controller

import (
	"Gator_blog/model"
	"time"
)

type BlogWithMeta struct {
	ID        uint            `json:"id"`
	Title     string          `json:"title"`
	Post      string          `json:"post"`
	UserID    uint            `json:"user_id"`
	UserName  string          `json:"user_name"`
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	Likes     int64           `json:"likes"`
	Comments  []model.Comment `json:"comments"`
}
