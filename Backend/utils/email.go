package utils

import (
	"fmt"
	"log"
	"net/smtp"
)

type EmailConfig struct {
	Sender   string
	Password string
	Host     string
	Port     string
}

var Config = EmailConfig{
	Sender:   "gatorblog.help@gmail.com",
	Password: "vuky tvmy ojhj nksr",
	Host:     "smtp.gmail.com",
	Port:     "587",
}

func SendResetCodeEmail(toEmail, code string) error {
	auth := smtp.PlainAuth("", Config.Sender, Config.Password, Config.Host)
	subject := "Subject: Password Reset Code\r\n"
	body := fmt.Sprintf("Your password reset code is: %s\n\nThis code expires in 10 minutes.", code)
	msg := []byte(subject + "\r\n" + body)

	err := smtp.SendMail(Config.Host+":"+Config.Port, auth, Config.Sender, []string{toEmail}, msg)
	if err != nil {
		log.Println("Error sending email:", err)
		return err
	}
	log.Println("Reset code sent to:", toEmail)
	return nil
}
