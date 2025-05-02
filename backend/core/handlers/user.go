package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"polyprep/config"
	"polyprep/database"
	models "polyprep/model"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

//------------------------------STATUS CODE------------------------------//
// 								200 : StatusOK							 //
// 								400 : StatusBadRequest					 //
// 								401 : StatusUnauthorized				 //
// 								403	: StatusForbidden					 //
// 								404	: StatusNotFound 					 //
// 								405	: StatusMethodNotAllowed    		 //
// 								500	: StatusInternalServerError    		 //
//-----------------------------------------------------------------------//

//------------------------------GET/user------------------------------//

func GetUser(c *gin.Context) {
	userUUID := c.Query("id")

	if userUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "User ID is required"})
		return
	}

	if _, err := uuid.Parse(userUUID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid user ID format"})
		return
	}

	var user models.User
	result := database.DB.Select("id", "username", "icon", "uuid").
		Where("uuid = ?", userUUID).
		First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		} else {
			log.Printf("Database error: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.UUID,
		"username": user.Username,
		"img_link": user.Icon,
	})
}

//------------------------------GET/user/posts------------------------------//

func GetAllUserPosts(c *gin.Context) {

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not authenticated",
		})
		return
	}

	var posts []models.Post
	result := database.DB.Where("author_id = ?", currentUserID).Find(&posts)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "No posts found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	if len(posts) == 0 {
		c.JSON(http.StatusOK, []interface{}{})
		return
	}

	response := make([]gin.H, len(posts))
	for i, post := range posts {
		response[i] = gin.H{
			"id":           post.ID,
			"created_at":   post.CreatedAt.Unix(),
			"updated_at":   post.UpdatedAt.Unix(),
			"scheduled_at": post.ScheduledAt.Unix(),
			"author_id":    post.AuthorID,
			"title":        post.Title,
			"text":         post.Text,
			"public":       post.Public,
			"hashtages":    post.Hashtages,
		}
	}

	c.JSON(http.StatusOK, response)
}

//------------------------------POST/user/photo------------------------------//

func UploadUserPhoto(c *gin.Context) {

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{ //401
			"message": "User not authenticated",
		})
		return
	}

	file, _, err := c.Request.FormFile("image")
	if err != nil {
		log.Printf("Error getting file from form: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "strike"})
		return
	}
	defer file.Close()

	s3Config := config.LoadBegetS3Config()

	s3Session, err := session.NewSession(&aws.Config{
		Endpoint: aws.String(s3Config.Endpoint),
		Region:   aws.String(s3Config.Region),
		Credentials: credentials.NewStaticCredentials(
			s3Config.AccessKeyID,
			s3Config.SecretAccessKey,
			"",
		),
		S3ForcePathStyle: aws.Bool(true),
	})

	if err != nil {
		log.Printf("Error creating S3 session: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error S3"})
		return
	}

	fileName := fmt.Sprintf("users/%s/avatar.png", userID)

	uploader := s3manager.NewUploader(s3Session)
	_, err = uploader.Upload(&s3manager.UploadInput{
		Bucket:      aws.String(s3Config.Bucket),
		Key:         aws.String(fileName),
		Body:        file,
		ContentType: aws.String("image/png"),
	})
	if err != nil {
		log.Printf("Error uploading to S3: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error upload"})
		return
	}

	imageURL := fmt.Sprintf("%s/%s/%s", s3Config.Endpoint, s3Config.Bucket, fileName)

	result := database.DB.Model(&models.User{}).
		Where("uuid = ?", userID).
		Update("icon", imageURL)
	if result.Error != nil {
		log.Printf("Error updating user avatar: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "error updating in DB"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"img_link": imageURL,
	})
}
