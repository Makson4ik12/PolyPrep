package handlers

import (
	"net/http"
	"polyprep/database"
	"strconv"

	models "polyprep/model"

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

//------------------------------GET/like------------------------------//

func GetLikes(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id")) //get id
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid post ID",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err != nil { //check post if exist
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

	currentUserID := c.GetString("user_id") //check "Public"
	if !post.Public && post.AuthorID != currentUserID {
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
			"message": "No access to private post",
		})
		return
	}

	var likes []models.Like
	if err := database.DB.Where("post_id = ?", postID).Find(&likes).Error; err != nil { //get like
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to get likes",
		})
		return
	}

	if len(likes) == 0 { //make resp
		c.JSON(http.StatusOK, gin.H{ //200
			"message": "No likes found for this post",
			"post_id": postID,
			"count":   0,
			"likes":   []interface{}{},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"post_id": postID,
		"count":   len(likes),
		"likes":   likes,
	})
}

//------------------------------POST/like------------------------------//

type LikeRequest struct {
	PostID uint `json:"post_id" binding:"required"`
}

func LikePost(c *gin.Context) {

	var req LikeRequest
	if err := c.ShouldBindJSON(&req); err != nil { //get "Request body"
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid request data",
			"details": err.Error(),
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

	var post models.Post
	if err := database.DB.First(&post, req.PostID).Error; err != nil { //post exist?
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

	if !post.Public && post.AuthorID != currentUserID { //check "Public"
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
			"message": "No access to private post",
		})
		return
	}

	var existingLike models.Like
	if err := database.DB.Where("user_id = ? AND post_id = ?", currentUserID, req.PostID).First(&existingLike).Error; err == nil { //check second like
		c.JSON(http.StatusConflict, gin.H{ //409
			"message": "You have already liked this post",
		})
		return
	}

	like := models.Like{
		UserID: currentUserID,
		PostID: req.PostID,
	}

	if err := database.DB.Create(&like).Error; err != nil { //save in bd
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to like post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"message": "Post liked successfully",
		"like_id": like.ID,
		"post_id": like.PostID,
		"user_id": like.UserID,
	})
}

//------------------------------DELETE/like------------------------------//

func DeleteLike(c *gin.Context) {

	likeID, err := strconv.Atoi(c.Query("id")) //get id(integer)
	if err != nil || likeID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid like ID",
		})
		return
	}

	currentUserID := c.GetString("user_id") //get user_id
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{ //401
			"message": "User not authenticated",
		})
		return
	}

	var like models.Like
	if err := database.DB.First(&like, likeID).Error; err != nil { //find like
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{ //404
				"message": "Like not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	if like.UserID != currentUserID { //check author post = this user
		c.JSON(http.StatusForbidden, gin.H{ //403
			"message": "You can only delete your own likes",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, like.PostID).Error; err == nil { //check "Public"
		if !post.Public && post.AuthorID != currentUserID {
			c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
				"message": "No access to private post likes",
			})
			return
		}
	}

	if err := database.DB.Delete(&like).Error; err != nil { //delete like
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to delete like",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"message": "Like deleted successfully",
	})
}
