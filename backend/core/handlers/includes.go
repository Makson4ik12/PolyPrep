package handlers

import (
	"bytes"
	"net/http"
	"polyprep/config"
	"polyprep/database"
	models "polyprep/model"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"fmt"
	"path/filepath"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
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
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Authorization required",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "Post not found",
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
			"message": "No access to private post",
		})
		return
	}

	var includes []struct {
		ID uint `json:"id"`
	}

	if err := database.DB.Model(&models.Include{}).
		Where("post_id = ?", postID).
		Select("id").
		Find(&includes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get includes",
			"error":   err.Error(),
		})
		return
	}

	includeIDs := make([]uint, len(includes))
	for i, inc := range includes {
		includeIDs[i] = inc.ID
	}

	if len(includeIDs) == 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "No includes found for this post",
		})
		return
	}

	c.JSON(http.StatusOK, includeIDs)
}

// ------------------------------POST/include-----------------------------//

func UploadIncludes(c *gin.Context) {

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Authorization required"})
		return
	}

	var request struct {
		PostID   uint   `json:"post_id" binding:"required"`
		Filename string `json:"filename" binding:"required"`
		Blob     struct {
			Data []byte `json:"data"`
		} `json:"blob" binding:"required"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request format",
			"details": err.Error(),
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, request.PostID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{"message": "Post not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Database error"})
		}
		return
	}

	if !post.Public && post.AuthorID != currentUserID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{"message": "No access to private post"})
		return
	}

	if !isValidFilename(request.Filename) {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid filename"})
		return
	}

	fileExt := filepath.Ext(request.Filename)
	fileName := fmt.Sprintf("%s%s", uuid.New().String(), fileExt)
	s3Key := fmt.Sprintf("posts/%d/%s", request.PostID, fileName)
	contentType := detectContentType(fileExt)

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
	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Bucket:      aws.String(cfg.Bucket),
		Key:         aws.String(s3Key),
		Body:        bytes.NewReader(request.Blob.Data),
		ContentType: aws.String(contentType),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to upload file to S3",
			"error":   err.Error(),
		})
		return
	}

	include := models.Include{
		PostID: request.PostID,
		Data:   s3Key,
		Type:   contentType,
		Size:   int64(len(request.Blob.Data)),
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "File uploaded successfully",
		"data": gin.H{
			"id":       include.ID,
			"post_id":  include.PostID,
			"filename": request.Filename,
			"size":     include.Size,
			"type":     include.Type,
		},
	})
}

func isValidFilename(filename string) bool {
	return !strings.ContainsAny(filename, "/\\?%*:|\"<>")
}

func detectContentType(ext string) string {
	switch strings.ToLower(ext) {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".pdf":
		return "application/pdf"
	case ".mp4":
		return "video/mp4"
	case ".mp3":
		return "audio/mpeg"
	case ".txt":
		return "text/plain"
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
