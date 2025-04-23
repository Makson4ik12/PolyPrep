package models

import (
	"time"

	"github.com/lib/pq"
)

type Post struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	ScheduledAt time.Time      `json:"scheduled_at"`
	AuthorID    string         `gorm:"not null" json:"author_id"`
	Title       string         `gorm:"size:255;not null" json:"title"`
	Text        string         `gorm:"type:text;not null" json:"text"`
	Public      bool           `gorm:"default:true" json:"public"`
	Hashtages   pq.StringArray `gorm:"type:text[]" json:"hashtages"`
}

type Include struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	PostID uint   `gorm:"not null" json:"post_id"`
	Data   string `gorm:"type:text;not null" json:"data"`
	Type   string `gorm:"size:20;not null" json:"type"`
}

type Like struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	UserID    string `gorm:"not null" json:"user_id"`
	PostID    uint   `gorm:"not null" json:"post_id"`
	CreatedAt int64  `gorm:"autoCreateTime" json:"created_at"`
}

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	AuthorID  string    `gorm:"not null" json:"author_id"`
	PostID    uint      `gorm:"not null" json:"post_id"`
	Text      string    `gorm:"type:text;not null" json:"text"`
}

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	UUID     string `gorm:"type:varchar(36);uniqueIndex;not null" json:"uuid"`
	Username string `gorm:"size:50;not null;unique" json:"username"`
	Email    string `gorm:"size:100" json:"email"`
	Icon     string `gorm:"type:text" json:"icon"`
}
