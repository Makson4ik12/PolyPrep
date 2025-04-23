package handlers

import (
	"errors"
	"log"
	"net/http"
	"polyprep/database"
	models "polyprep/model"

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
	result := database.DB.Select("id", "username", "icon").
		Where("uuid = ?", userUUID).
		First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		} else {
			log.Printf("Database error: %v", result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
				"error":   result.Error.Error(),
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.UUID,
		"username": user.Username,
		"icon":     user.Icon,
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
				"error":   result.Error.Error(),
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
