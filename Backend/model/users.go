package model

import "time"

type User struct {

	ID               uint   `json:"id" gorm:"primaryKey;autoIncrement"`
	Username         string `json:"username" gorm:"unique;not null;size:255"`
	Email            string `json:"email" gorm:"unique;not null;size:255"`
	Password         string `json:"password" gorm:"not null;column:password;size:255"`
	ResetCode        string `json:"-" gorm:"size:6"`
	ResetCodeExpiry  time.Time `json:"-"`
}

