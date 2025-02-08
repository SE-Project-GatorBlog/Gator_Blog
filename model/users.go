package model

type User struct {
	ID       uint   `json:"id" gorm:"primaryKey"`
	Username string `json:"username" gorm:"not null;column:username;size:255"`
	Email    string `json:"email" gorm:"not null;column:email;size:255"`
	Password string `json:"password" gorm:"not null;column:password;size:255"`
}
