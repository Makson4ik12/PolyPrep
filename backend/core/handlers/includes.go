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

	currentUserID := c.GetString("user_id")             //get user_id
	if !post.Public && post.AuthorID != currentUserID { //check "Public"
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
			"message": "No access to private post comments",
		})
		return
	}

	var includes []models.Include
	if err := database.DB.Where("post_id = ?", postID).Find(&includes).Error; err != nil { //get like
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to get likes",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"message": "а хуй знает",
	})
}

// ------------------------------POST/include-----------------------------//

type IncludesRequest struct {
	PostID uint   `json:"post_id" binding:"required"`
	Blob   string `json:"blob" binding:"required"`
}

func LoadIncludes(c *gin.Context) {

	c.JSON(http.StatusOK, gin.H{ //200
		"message": "а хуй знает",
	})
}

// ------------------------------DELETE/include---------------------------//
func DeleteIncludes(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id")) //get id(integer)
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid post ID",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"message": "а хуй знает",
	})
}
