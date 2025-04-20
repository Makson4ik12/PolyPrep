package handlers

import (
	"net/http"
	"polyprep/database"
	"strconv"

	models "polyprep/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPostLikes(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id"))
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid post ID",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Post not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	currentUserID := c.GetString("user_id")
	if !post.Public && post.AuthorID != currentUserID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"message": "No access to private post",
		})
		return
	}

	var likes []models.Like
	if err := database.DB.Where("post_id = ?", postID).Find(&likes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get likes",
		})
		return
	}

	if len(likes) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"message": "No likes found for this post",
			"post_id": postID,
			"count":   0,
			"likes":   []interface{}{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"post_id": postID,
		"count":   len(likes),
		"likes":   likes,
	})
}

type LikeRequest struct {
	PostID uint `json:"post_id" binding:"required"`
}

func LikePost(c *gin.Context) {

	var req LikeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
			"details": err.Error(),
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
	if err := database.DB.First(&post, req.PostID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
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

	var existingLike models.Like
	if err := database.DB.Where("user_id = ? AND post_id = ?", currentUserID, req.PostID).First(&existingLike).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "You have already liked this post",
		})
		return
	}

	like := models.Like{
		UserID: currentUserID,
		PostID: req.PostID,
	}

	if err := database.DB.Create(&like).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to like post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Post liked successfully",
		"like_id": like.ID,
		"post_id": like.PostID,
		"user_id": like.UserID,
	})
}
