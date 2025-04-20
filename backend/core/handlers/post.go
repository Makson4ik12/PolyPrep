package handlers

import (
	"net/http"
	"polyprep/database"
	models "polyprep/model"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func GetPost(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id"))
	if err != nil || postID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid post ID",
		})
		return
	}

	var post models.Post
	result := database.DB.First(&post, postID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
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
		c.JSON(http.StatusForbidden, gin.H{
			"message": "No access to private post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           post.ID,
		"created_at":   post.CreatedAt.Unix(),
		"updated_at":   post.UpdatedAt.Unix(),
		"scheduled_at": post.ScheduledAt.Unix(),
		"author_id":    post.AuthorID,
		"title":        post.Title,
		"text":         post.Text,
		"public":       post.Public,
		"hashtags":     post.Hashtags,
	})
}

type CreatePostRequest struct {
	Title       string   `json:"title" binding:"required"`
	Text        string   `json:"text" binding:"required"`
	Hashtags    []string `json:"hashtags" binding:"required"`
	Public      bool     `json:"public"`
	ScheduledAt int64    `json:"scheduled_at"`
}

func CreatePost(c *gin.Context) {

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	authorID := c.GetString("user_id")
	if authorID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "User not authenticated",
		})
		return
	}

	post := models.Post{
		Title:       req.Title,
		Text:        req.Text,
		Hashtags:    req.Hashtags,
		Public:      req.Public,
		AuthorID:    authorID,
		ScheduledAt: time.Unix(req.ScheduledAt, 0),
	}

	if err := database.DB.Create(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           post.ID,
		"title":        post.Title,
		"text":         post.Text,
		"hashtags":     post.Hashtags,
		"public":       post.Public,
		"scheduled_at": post.ScheduledAt.Unix(),
		"author_id":    post.AuthorID,
		"created_at":   post.CreatedAt.Unix(),
		"updated_at":   post.UpdatedAt.Unix(),
	})
}

type UpdatePostRequest struct {
	ID          uint     `json:"id" binding:"required"`
	Title       string   `json:"title"`
	Text        string   `json:"text"`
	Hashtags    []string `json:"hashtags"`
	Public      *bool    `json:"public"`
	ScheduledAt int64    `json:"scheduled_at"`
}

func UpdatePost(c *gin.Context) {

	var req UpdatePostRequest
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
	result := database.DB.First(&post, req.ID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
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

	if post.AuthorID != currentUserID {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "You can only edit your own posts",
		})
		return
	}

	if req.Title != "" {
		post.Title = req.Title
	}
	if req.Text != "" {
		post.Text = req.Text
	}
	if req.Hashtags != nil {
		post.Hashtags = req.Hashtags
	}
	if req.Public != nil {
		post.Public = *req.Public
	}
	if req.ScheduledAt != 0 {
		post.ScheduledAt = time.Unix(req.ScheduledAt, 0)
	}

	if err := database.DB.Save(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           post.ID,
		"title":        post.Title,
		"text":         post.Text,
		"hashtags":     post.Hashtags,
		"public":       post.Public,
		"scheduled_at": post.ScheduledAt.Unix(),
		"updated_at":   post.UpdatedAt.Unix(),
	})
}

func DeletePost(c *gin.Context) {

	postID, err := strconv.ParseUint(c.Query("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid post ID format",
		})
		return
	}

	currentUserID := c.GetString("user_id")
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Authentication required",
		})
		return
	}

	var post models.Post
	result := database.DB.First(&post, postID)
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
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

	if post.AuthorID != currentUserID {
		if !post.Public {
			c.JSON(http.StatusMethodNotAllowed, gin.H{
				"message": "No access to private post",
			})
		} else {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "You don't have permission to delete this post",
			})
		}
		return
	}

	if err := database.DB.Delete(&post).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Post deleted successfully",
		"data": gin.H{
			"post_id":    post.ID,
			"deleted_at": time.Now().Unix(),
		},
	})
}

func SearchPosts(c *gin.Context) {

	searchText := strings.TrimSpace(c.Query("text"))
	from, errFrom := strconv.Atoi(c.Query("from"))
	to, errTo := strconv.Atoi(c.Query("to"))

	if searchText == "" || errFrom != nil || errTo != nil || from < 0 || to <= from {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid search parameters",
			"details": map[string]interface{}{
				"required": map[string]string{
					"text": "non-empty string",
					"from": "integer >= 0",
					"to":   "integer > from",
				},
			},
		})
		return
	}

	var posts []models.Post
	query := database.DB.Where(
		"public = true AND (title ILIKE ? OR text ILIKE ? OR hashtags ILIKE ?)",
		"%"+searchText+"%",
		"%"+searchText+"%",
		"%"+searchText+"%",
	).Order("created_at DESC")

	var total int64
	query.Model(&models.Post{}).Count(&total)
	result := query.Offset(from).Limit(to - from).Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database error",
		})
		return
	}

	if len(posts) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "No posts found",
			"search":  searchText,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":   total,
		"from":    from,
		"to":      from + len(posts),
		"results": posts,
	})
}

func GetRandomPosts(c *gin.Context) {

	countStr := c.Query("count")
	count, err := strconv.Atoi(countStr)
	if err != nil || count <= 0 || count > 100 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid count parameter (must be integer between 1 and 100)",
		})
		return
	}

	var posts []models.Post
	result := database.DB.Where("public = true").
		Order("RANDOM()").
		Limit(count).
		Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database error",
		})
		return
	}

	if len(posts) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "No public posts available",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(posts),
		"posts": posts,
	})
}
