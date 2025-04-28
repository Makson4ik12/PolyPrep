package handlers

import (
	"net/http"
	"polyprep/database"
	models "polyprep/model"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

//------------------------------GET/share------------------------------//

func GetShareLink(c *gin.Context) {

	postID := c.Query("id")
	if postID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Post ID parameter is required",
		})
		return
	}

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not authenticated",
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
		c.JSON(http.StatusForbidden, gin.H{
			"message": "No access to private post",
		})
		return
	}

	var share models.Share
	if err := database.DB.Where("post_id = ? AND expires_at > ?", postID, time.Now()).
		First(&share).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "No active share link found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uuid":       share.UUID,
		"expires_at": share.ExpiresAt.Unix(),
	})
}

//------------------------------POST/share-----------------------------//

func CreateShareLink(c *gin.Context) {

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not authenticated",
		})
		return
	}

	var request struct {
		PostID    uint  `json:"post_id" binding:"required"`
		ExpiresAt int64 `json:"expires_at"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body: " + err.Error(),
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, request.PostID).Error; err != nil {
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

	formattedUUID := uuid.New().String()

	share := models.Share{
		PostID:    post.ID,
		UUID:      formattedUUID,
		UserID:    currentUserID,
		ExpiresAt: time.Unix(request.ExpiresAt, 0),
	}

	if err := database.DB.Create(&share).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create share link",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"uuid":       share.UUID,
		"expires_at": share.ExpiresAt.Unix(),
	})
}

//------------------------------DELETE/share---------------------------//

func DeleteShareLink(c *gin.Context) {

	uuid := c.Query("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "UUID parameter is required",
		})
		return
	}

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not authenticated",
		})
		return
	}

	var share models.Share
	if err := database.DB.Where("uuid = ?", uuid).First(&share).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "Shared link not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	var post models.Post
	if err := database.DB.First(&post, share.PostID).Error; err == nil {
		if share.UserID != currentUserID && post.AuthorID != currentUserID {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "No permission to delete this link",
			})
			return
		}
	}

	if err := database.DB.Delete(&share).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete shared link",
		})
		return
	}

	c.Status(http.StatusOK)
}
