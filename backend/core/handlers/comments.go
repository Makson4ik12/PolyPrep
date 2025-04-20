package handlers

import (
	"net/http"
	"polyprep/database"
	"strconv"

	models "polyprep/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPostComments(c *gin.Context) {

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
			"message": "No access to private post comments",
		})
		return
	}

	var comments []models.Comment
	if err := database.DB.Where("post_id = ?", postID).
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get comments",
		})
		return
	}

	response := make([]gin.H, len(comments))
	for i, comment := range comments {
		response[i] = gin.H{
			"id":         comment.ID,
			"created_at": comment.CreatedAt.Unix(),
			"updated_at": comment.UpdatedAt.Unix(),
			"author_id":  comment.AuthorID,
			"post_id":    comment.PostID,
			"text":       comment.Text,
		}
	}

	c.JSON(http.StatusOK, response)
}

type CreateCommentRequest struct {
	Text   string `json:"text" binding:"required"`
	PostID uint   `json:"post_id" binding:"required"`
}

func CreateComment(c *gin.Context) {

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	authorID, exists := c.Get("user_id")
	if !exists {
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

	if !post.Public && post.AuthorID != authorID.(string) {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"message": "No access to private post",
		})
		return
	}

	comment := models.Comment{
		Text:     req.Text,
		PostID:   req.PostID,
		AuthorID: authorID.(string),
	}

	if err := database.DB.Create(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         comment.ID,
		"created_at": comment.CreatedAt.Unix(),
		"updated_at": comment.UpdatedAt.Unix(),
		"author_id":  comment.AuthorID,
		"post_id":    comment.PostID,
		"text":       comment.Text,
	})
}

type UpdateCommentRequest struct {
	ID     uint   `json:"id" binding:"required"`
	Text   string `json:"text" binding:"required"`
	PostID uint   `json:"post_id" binding:"required"`
}

func UpdateComment(c *gin.Context) {

	var req UpdateCommentRequest
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

	var comment models.Comment
	if err := database.DB.First(&comment, req.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Comment not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	if comment.AuthorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "You can only edit your own comments",
		})
		return
	}

	comment.Text = req.Text
	if err := database.DB.Save(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         comment.ID,
		"text":       comment.Text,
		"post_id":    comment.PostID,
		"author_id":  comment.AuthorID,
		"updated_at": comment.UpdatedAt.Unix(),
	})
}

func DeleteComment(c *gin.Context) {

	commentID, err := strconv.Atoi(c.Query("id"))
	if err != nil || commentID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid comment ID",
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

	var comment models.Comment
	if err := database.DB.First(&comment, commentID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"message": "Comment not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	if comment.AuthorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "You can only delete your own comments",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, comment.PostID).Error; err == nil {
		if !post.Public && post.AuthorID != currentUserID {
			c.JSON(http.StatusMethodNotAllowed, gin.H{
				"message": "No access to private post comments",
			})
			return
		}
	}

	if err := database.DB.Delete(&comment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Comment deleted successfully",
		"comment_id": comment.ID,
	})
}
