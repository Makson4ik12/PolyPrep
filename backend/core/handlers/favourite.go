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

// -----------------------------GET/favourite----------------------------//
func GetFavourites(c *gin.Context) {

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{ //401
			"message": "User not authenticated",
		})
		return
	}

	var favourites []struct {
		ID        uint  `json:"id"`
		CreatedAt int64 `json:"created_at"`
		PostID    uint  `json:"post_id"`
	}

	if err := database.DB.Table("favourites").
		Select("id, EXTRACT(EPOCH FROM created_at)::bigint as created_at, post_id").
		Where("user_id = ?", currentUserID).
		Scan(&favourites).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{ //500
			"message": "Failed to get favourites",
			"error":   err.Error(),
		})
		return
	}

	if len(favourites) == 0 {
		c.JSON(http.StatusForbidden, gin.H{ //403
			"message": "Favourites not found",
		})
		return
	}

	var validFavourites []gin.H
	for _, fav := range favourites {
		var post models.Post
		if err := database.DB.First(&post, fav.PostID).Error; err != nil {
			continue
		}

		if !post.Public && post.AuthorID != currentUserID {
			continue
		}

		validFavourites = append(validFavourites, gin.H{
			"id":         fav.ID,
			"created_at": fav.CreatedAt,
			"post_id":    fav.PostID,
		})
	}

	if len(validFavourites) == 0 {
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
			"message": "No access to private posts",
		})
		return
	}

	c.JSON(http.StatusOK, validFavourites) //200
}

// ------------------------------POST/favourite------------------------------//
func AddFavourites(c *gin.Context) {

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not authenticated",
		})
		return
	}

	var request struct {
		PostID uint `json:"post_id" binding:"required"`
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
			c.JSON(http.StatusForbidden, gin.H{ // 403
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
		c.JSON(http.StatusMethodNotAllowed, gin.H{ // 405
			"message": "No access to private post",
		})
		return
	}

	var existingFavourite models.Favourite
	if err := database.DB.Where("user_id = ? AND post_id = ?", currentUserID, request.PostID).
		First(&existingFavourite).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{
			"message": "Post already in favourites",
		})
		return
	}

	favourite := models.Favourite{
		UserID: currentUserID,
		PostID: request.PostID,
	}

	if err := database.DB.Create(&favourite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to add to favourites",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}

// ------------------------------DELETE/favourite------------------------------//
func DeleteFromFavourites(c *gin.Context) {

	postID, err := strconv.ParseUint(c.Query("id"), 10, 32) //get id(integer)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid post ID format",
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

	var favourite models.Favourite
	if err := database.DB.Where("user_id = ? AND post_id = ?", currentUserID, postID).
		First(&favourite).Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{ // 403
				"message": "Favourite not found for this post",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	var post models.Post
	if err := database.DB.First(&post, postID).Error; err == nil {
		if !post.Public && post.AuthorID != currentUserID {
			c.JSON(http.StatusMethodNotAllowed, gin.H{
				"message": "No access to private post favourites",
			})
			return
		}
	}

	if err := database.DB.Delete(&favourite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete favourite",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Favourite deleted successfully",
	})
}

// ------------------------------GET/favourite/check------------------------------//

func CheckFavourite(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id"))
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{ //400
			"message": "Invalid post ID",
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
	if err := database.DB.First(&post, postID).Error; err != nil {
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

	var favourite models.Favourite
	err = database.DB.Where("user_id = ? AND post_id = ?", currentUserID, postID).
		First(&favourite).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{ //404
				"message": "Post is not in favourites",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //500
				"message": "Database error",
			})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"message": "Post is in favourites",
	})
}
