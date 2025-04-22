package handlers

import (
	"net/http"
	"polyprep/database"
	models "polyprep/model"
	"strconv"

	"github.com/gin-gonic/gin"
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
	userID, err := strconv.ParseUint(c.Query("id"), 10, 32)
	if err != nil || userID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid user ID",
		})
		return
	}

	var user models.User
	result := database.DB.Select("id", "username", "icon").First(&user, userID)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "User not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":       user.ID,
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
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Failed to get user posts",
		})
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
			"hashtags":     post.Hashtags,
		}
	}

	c.JSON(http.StatusOK, response)
}
