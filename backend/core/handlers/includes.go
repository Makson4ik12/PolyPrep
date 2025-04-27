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

// ------------------------------GET/include------------------------------//
func GetIncludes(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id")) //get id(integer)
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid post ID",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil { //check comm
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{ //404
				"message": "Post not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	currentUserID := c.GetString("user_id")
	if !post.Public && post.AuthorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{
			"start":      0,
			"created_at": 0,
			"link":       "string",
			"next_id":    0,
		})
		return
	}

	var includes []models.Include
	if err := database.DB.Where("post_id = ?", postID).Find(&includes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get includes",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Includes retrieved successfully",
		"data":    includes,
	})
}

// ------------------------------POST/include-----------------------------//

func LoadIncludes(c *gin.Context) {

	var request struct {
		PostID uint   `json:"post_id"`
		Blob   string `json:"blob"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request body",
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

	currentUserID := c.GetString("user_id")
	if post.AuthorID != currentUserID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"message": "No access to private post",
		})
		return
	}

	newInclude := models.Include{
		PostID: request.PostID,
		Data:   request.Blob,
		Type:   "blob",
	}

	if err := database.DB.Create(&newInclude).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create include",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Include added successfully",
		"data": gin.H{
			"id":      newInclude.ID,
			"post_id": newInclude.PostID,
		},
	})
}

// ------------------------------DELETE/include------------------------------//

func DeleteIncludes(c *gin.Context) {

	includeID, err := strconv.Atoi(c.Query("id"))
	if err != nil || includeID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid include ID",
		})
		return
	}

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{ //401
			"message": "User not authenticated",
		})
		return
	}

	var include models.Include
	if err := database.DB.First(&include, includeID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{ //403
				"message": "Include not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	var post models.Post
	if err := database.DB.First(&post, include.PostID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{ //403
				"message": "Post not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	if post.AuthorID != currentUserID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
			"message": "No access to delete include from this post",
		})
		return
	}

	if err := database.DB.Delete(&include).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to delete include",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Include deleted successfully",
	})
}
