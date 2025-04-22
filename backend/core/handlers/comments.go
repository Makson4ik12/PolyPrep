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

//------------------------------GET/comment------------------------------//

func GetComments(c *gin.Context) {

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

	var comments []models.Comment
	if err := database.DB.Where("post_id = ?", postID).
		Order("created_at DESC").
		Find(&comments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get comments",
		})
		return
	}

	response := make([]gin.H, len(comments)) //make resp
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

	c.JSON(http.StatusOK, response) //200
}

//------------------------------POST/comment------------------------------//

type CreateCommentRequest struct {
	Text   string `json:"text" binding:"required"`
	PostID uint   `json:"post_id" binding:"required"`
}

func CreateComment(c *gin.Context) {

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil { //get valid date
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	authorID, exists := c.Get("user_id") //get user_id
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{ //401
			"message": "User not authenticated",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, req.PostID).Error; err != nil { //check post if exist
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

	if !post.Public && post.AuthorID != authorID.(string) { //check "Public"
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
			"message": "No access to private post",
		})
		return
	}

	comment := models.Comment{
		Text:     req.Text,
		PostID:   req.PostID,
		AuthorID: authorID.(string),
	}

	if err := database.DB.Create(&comment).Error; err != nil { //save in bd
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"id":         comment.ID,
		"created_at": comment.CreatedAt.Unix(),
		"updated_at": comment.UpdatedAt.Unix(),
		"author_id":  comment.AuthorID,
		"post_id":    comment.PostID,
		"text":       comment.Text,
	})
}

//------------------------------PUT/comment------------------------------//

type UpdateCommentRequest struct {
	ID     uint   `json:"id" binding:"required"`
	Text   string `json:"text" binding:"required"`
	PostID uint   `json:"post_id" binding:"required"`
}

func UpdateComment(c *gin.Context) {

	var req UpdateCommentRequest //get data
	if err := c.ShouldBindJSON(&req); err != nil {
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
	if err := database.DB.First(&post, req.PostID).Error; err != nil { //checking the message for existence
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

	var comment models.Comment
	if err := database.DB.First(&comment, req.ID).Error; err != nil { //find comment
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{ //404
				"message": "Comment not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	if comment.AuthorID != currentUserID { //check autor = this user
		c.JSON(http.StatusForbidden, gin.H{ //403
			"message": "You can only edit your own comments",
		})
		return
	}

	comment.Text = req.Text
	if err := database.DB.Save(&comment).Error; err != nil { //update comment
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to update comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"id":         comment.ID,
		"text":       comment.Text,
		"post_id":    comment.PostID,
		"author_id":  comment.AuthorID,
		"updated_at": comment.UpdatedAt.Unix(),
	})
}

//------------------------------DELETE/comment------------------------------//

func DeleteComment(c *gin.Context) {

	commentID, err := strconv.Atoi(c.Query("id")) //get id(integer)
	if err != nil || commentID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid comment ID",
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

	var comment models.Comment
	if err := database.DB.First(&comment, commentID).Error; err != nil { //find comment
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{ //404
				"message": "Comment not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	if comment.AuthorID != currentUserID { //check autor = this user
		c.JSON(http.StatusForbidden, gin.H{ //403
			"message": "You can only delete your own comments",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, comment.PostID).Error; err == nil { //check "Public"
		if !post.Public && post.AuthorID != currentUserID {
			c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
				"message": "No access to private post comments",
			})
			return
		}
	}

	if err := database.DB.Delete(&comment).Error; err != nil { //delete comment
		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to delete comment",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"message":    "Comment deleted successfully",
		"comment_id": comment.ID,
	})
}
