package handlers

import (
	"bytes"
	"errors"
	"io"
	"log"
	"net/http"
	"polyprep/config"
	"polyprep/database"
	models "polyprep/model"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"fmt"
	"path/filepath"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"github.com/google/uuid"
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

// ------------------------------GET/include------------------------------//

func GetIncludes(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id"))
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid post ID",
		})
		return
	}

	currentUserID := c.GetString("user_id")

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "includes not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	if !post.Public && post.AuthorID != currentUserID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"message": "no access",
		})
		return
	}

	var includes []models.Include
	if err := database.DB.Where("post_id = ?", postID).Find(&includes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get includes",
			"error":   err.Error(),
		})
		return
	}

	if len(includes) == 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "includes not found",
		})
		return
	}

	response := make([]gin.H, len(includes))
	for i, include := range includes {
		response[i] = gin.H{
			"link":     include.Data,
			"id":       include.ID,
			"filename": include.Type,
			"size":     include.Size,
		}
	}

	c.JSON(http.StatusOK, response)
}

// ------------------------------POST/include-----------------------------//

func UploadIncludes(c *gin.Context) {

	userID := c.GetString("user_id")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "User not authenticated"})
		return
	}

	postIDStr := c.Query("post_id")
	filename := c.Query("filename")

	if postIDStr == "" || filename == "" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Missing PostId or Filename headers"})
		return
	}

	postID, err := strconv.ParseUint(postIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid PostId format"})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusForbidden, gin.H{"message": "Пост не найден"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		}
		return
	}

	if !post.Public && post.AuthorID != userID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"message": "Нет доступа (пост приватный)"})
		return
	}

	fileBytes, err := io.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Error reading file: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid file data"})
		return
	}

	fileExt := filepath.Ext(filename)
	fileUUID := uuid.New().String()
	s3Key := fmt.Sprintf("posts/%d/includes/%s%s", post.ID, fileUUID, fileExt)

	s3Config := config.LoadBegetS3Config()
	_, err = s3manager.NewUploader(session.Must(session.NewSession(&aws.Config{
		Endpoint:         aws.String(s3Config.Endpoint),
		Region:           aws.String(s3Config.Region),
		Credentials:      credentials.NewStaticCredentials(s3Config.AccessKeyID, s3Config.SecretAccessKey, ""),
		S3ForcePathStyle: aws.Bool(true),
	}))).Upload(&s3manager.UploadInput{
		Bucket:      aws.String(s3Config.Bucket),
		Key:         aws.String(s3Key),
		Body:        bytes.NewReader(fileBytes),
		ContentType: aws.String("application/octet-stream"),
	})

	if err != nil {
		log.Printf("S3 upload error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "File upload failed"})
		return
	}

	include := models.Include{
		PostID: post.ID,
		Data:   fmt.Sprintf("%s/%s/%s", s3Config.Endpoint, s3Config.Bucket, s3Key),
		Type:   filename,
		Size:   int64(len(fileBytes)),
	}

	if err := database.DB.Create(&include).Error; err != nil {
		log.Printf("DB create error: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Failed to save include"})
		return
	}

	c.Status(http.StatusOK)
}

func detectContentType(ext string) string {
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".pdf":
		return "application/pdf"
	case ".doc":
		return "application/msword"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".zip":
		return "application/zip"
	case ".mp3":
		return "audio/mpeg"
	case ".mp4":
		return "video/mp4"
	default:
		return "application/octet-stream"
	}
}

// ------------------------------DELETE/include------------------------------//

func DeleteIncludes(c *gin.Context) {

	includeID, err := strconv.Atoi(c.Query("id"))
	if err != nil || includeID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid include ID",
		})
		return
	}

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Authorization required",
		})
		return
	}

	var include models.Include
	if err := database.DB.Preload("Post").First(&include, includeID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "Include not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
				"error":   err.Error(),
			})
		}
		return
	}

	if include.Post.AuthorID != currentUserID {
		if !include.Post.Public {
			c.JSON(http.StatusMethodNotAllowed, gin.H{
				"message": "No access to private post include",
			})
			return
		}
		c.JSON(http.StatusForbidden, gin.H{
			"message": "You can only delete your own includes",
		})
		return
	}

	cfg := config.LoadBegetS3Config()
	sess, err := session.NewSession(&aws.Config{
		Endpoint: aws.String(cfg.Endpoint),
		Region:   aws.String(cfg.Region),
		Credentials: credentials.NewStaticCredentials(
			cfg.AccessKeyID,
			cfg.SecretAccessKey,
			"",
		),
		S3ForcePathStyle: aws.Bool(true),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create S3 session",
			"error":   err.Error(),
		})
		return
	}

	s3Client := s3.New(sess)
	_, err = s3Client.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(cfg.Bucket),
		Key:    aws.String(include.Data),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete file from S3",
			"error":   err.Error(),
		})
		return
	}

	if err := database.DB.Delete(&include).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete include record",
			"error":   err.Error(),
		})
		return
	}

	c.Status(http.StatusOK)
}
