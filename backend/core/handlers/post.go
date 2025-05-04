package handlers

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"polyprep/config"
	"polyprep/database"
	models "polyprep/model"
	"strconv"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
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

//------------------------------GET/post------------------------------//

func GetPost(c *gin.Context) {

	postID, err := strconv.Atoi(c.Query("id")) //get id(integer)
	if err != nil || postID <= 0 {             //check id, return 400
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid post ID",
		})
		return
	}

	var post models.Post
	result := database.DB.First(&post, postID) //get post from db
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound { //if not found return 403
			c.JSON(http.StatusForbidden, gin.H{
				"message": "Post not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //return 500
				"message": "Database error",
			})
		}
		return
	}

	currentUserID := c.GetString("user_id")
	if !post.Public && post.AuthorID != currentUserID { //check "Public", return 405
		c.JSON(http.StatusMethodNotAllowed, gin.H{
			"message": "No access to private post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //return 200
		"id":           post.ID,
		"created_at":   post.CreatedAt.Unix(),
		"updated_at":   post.UpdatedAt.Unix(),
		"scheduled_at": post.ScheduledAt.Unix(),
		"author_id":    post.AuthorID,
		"title":        post.Title,
		"text":         post.Text,
		"public":       post.Public,
		"hashtages":    post.Hashtages,
	})
}

// ------------------------------POST/post------------------------------//
type CreatePostRequest struct {
	Title       string   `json:"title" binding:"required"`
	Text        string   `json:"text" binding:"required"`
	Hashtages   []string `json:"hashtages" binding:"required"`
	Public      bool     `json:"public"`
	ScheduledAt int64    `json:"scheduled_at"`
}

func CreatePost(c *gin.Context) {

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil { //get data
		c.JSON(http.StatusBadRequest, gin.H{ //if not return 400
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	authorID := c.GetString("user_id") //get user_id
	if authorID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{ //if not return 401
			"message": "User not authenticated",
		})
		return
	}

	post := models.Post{ //take struct
		Title:       req.Title,
		Text:        req.Text,
		Hashtages:   pq.StringArray(req.Hashtages),
		Public:      req.Public,
		AuthorID:    authorID,
		ScheduledAt: time.Unix(req.ScheduledAt, 0),
	}

	if err := database.DB.Create(&post).Error; err != nil { //create, if err return 500
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create post",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //return 200
		"id":           post.ID,
		"title":        post.Title,
		"text":         post.Text,
		"hashtages":    post.Hashtages,
		"public":       post.Public,
		"scheduled_at": post.ScheduledAt.Unix(),
		"author_id":    post.AuthorID,
		"created_at":   post.CreatedAt.Unix(),
		"updated_at":   post.UpdatedAt.Unix(),
	})
}

//------------------------------PUT/post------------------------------//

type UpdatePostRequest struct {
	ID          uint     `json:"id" binding:"required"`
	Title       string   `json:"title"`
	Text        string   `json:"text"`
	Hashtages   []string `json:"hashtages"`
	Public      *bool    `json:"public"`
	ScheduledAt int64    `json:"scheduled_at"`
}

func UpdatePost(c *gin.Context) {

	var req UpdatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{ //if err return 400
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	currentUserID := c.GetString("user_id") //get user_id
	if currentUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{ //return 401
			"message": "User not authenticated",
		})
		return
	}

	var post models.Post
	result := database.DB.First(&post, req.ID) //search post in db
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{ //return 404
				"message": "Post not found",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{ //return 500
				"message": "Database error",
			})
		}
		return
	}

	if post.AuthorID != currentUserID { //check "Public"
		c.JSON(http.StatusMethodNotAllowed, gin.H{ //405
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
	if req.Hashtages != nil {
		post.Hashtages = req.Hashtages
	}
	if req.Public != nil {
		post.Public = *req.Public
	}
	if req.ScheduledAt != 0 {
		post.ScheduledAt = time.Unix(req.ScheduledAt, 0)
	}

	if err := database.DB.Save(&post).Error; err != nil { //save post
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update post",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{ //200
		"id":           post.ID,
		"title":        post.Title,
		"text":         post.Text,
		"hashtages":    post.Hashtages,
		"public":       post.Public,
		"scheduled_at": post.ScheduledAt.Unix(),
		"updated_at":   post.UpdatedAt.Unix(),
	})
}

//------------------------------DELETE/post------------------------------//

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

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var post models.Post
	if err := tx.Set("gorm:query_option", "FOR UPDATE").First(&post, postID).Error; err != nil {
		tx.Rollback()
		if errors.Is(err, gorm.ErrRecordNotFound) {
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
		tx.Rollback()
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

	var includes []models.Include
	if err := tx.Where("post_id = ?", postID).Find(&includes).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to find post includes",
		})
		return
	}

	if len(includes) > 0 {
		s3Config := config.LoadBegetS3Config()
		sess, err := session.NewSession(&aws.Config{
			Endpoint:         aws.String(s3Config.Endpoint),
			Region:           aws.String(s3Config.Region),
			Credentials:      credentials.NewStaticCredentials(s3Config.AccessKeyID, s3Config.SecretAccessKey, ""),
			S3ForcePathStyle: aws.Bool(true),
		})
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Failed to initialize S3 session",
			})
			return
		}

		s3Client := s3.New(sess)
		for _, include := range includes {

			key := strings.TrimPrefix(include.Data, fmt.Sprintf("%s/%s/", s3Config.Endpoint, s3Config.Bucket))
			_, err := s3Client.DeleteObject(&s3.DeleteObjectInput{
				Bucket: aws.String(s3Config.Bucket),
				Key:    aws.String(key),
			})
			if err != nil {
				tx.Rollback()
				c.JSON(http.StatusInternalServerError, gin.H{
					"message": "Failed to delete files from storage",
				})
				return
			}
		}
	}

	entitiesToDelete := []interface{}{
		&models.Like{},
		&models.Comment{},
		&models.Favourite{},
		&models.Share{},
		&models.Include{},
	}

	for _, entity := range entitiesToDelete {
		if err := tx.Where("post_id = ?", postID).Delete(entity).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": fmt.Sprintf("Failed to delete related entities: %v", err),
			})
			return
		}
	}

	if err := tx.Delete(&post).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete post",
		})
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Transaction failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Post and all related data deleted successfully",
		"data": gin.H{
			"post_id":    post.ID,
			"deleted_at": time.Now().Unix(),
		},
	})
}

//------------------------------GET/post/search------------------------------//

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

	searchWords := strings.Fields(searchText)
	if len(searchWords) == 0 {
		searchWords = []string{searchText}
	}

	dbQuery := database.DB.Model(&models.Post{}).
		Where("public = true").
		Order("created_at DESC")

	for _, word := range searchWords {
		pattern := "%" + word + "%"

		dbQuery = dbQuery.Where(
			database.DB.Where("title ILIKE ?", pattern).
				Or("text ILIKE ?", pattern).
				Or("array_to_string(hashtages, ',') ILIKE ?", pattern),
		)
	}

	var total int64
	if err := dbQuery.Count(&total).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to count posts",
			"error":   err.Error(),
		})
		return
	}

	var posts []models.Post
	result := dbQuery.Offset(from).Limit(to - from).Find(&posts)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database error",
			"error":   result.Error.Error(),
		})
		return
	}

	if len(posts) == 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "No posts found",
			"search":  searchText,
		})
		return
	}

	formattedPosts := make([]gin.H, len(posts))
	for i, post := range posts {
		formattedPosts[i] = gin.H{
			"id":           post.ID,
			"title":        post.Title,
			"text":         post.Text,
			"hashtages":    post.Hashtages,
			"public":       post.Public,
			"scheduled_at": post.ScheduledAt.Unix(),
			"created_at":   post.CreatedAt.Unix(),
			"updated_at":   post.UpdatedAt.Unix(),
			"author_id":    post.AuthorID,
		}
	}

	response := gin.H{
		"total":  total,
		"from":   from,
		"to":     from + len(posts),
		"result": formattedPosts,
	}

	c.JSON(http.StatusOK, response)
}

//------------------------------GET/random------------------------------//

func GetRandomPosts(c *gin.Context) {
	countStr := c.Query("count")
	count, err := strconv.Atoi(countStr)
	if err != nil || count <= 0 {
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
		log.Printf("Database error: %v", result.Error)
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Database error",
			"error":   result.Error.Error(),
		})
		return
	}

	if len(posts) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"count": 0,
			"posts": []interface{}{},
		})
		return
	}

	formattedPosts := make([]gin.H, len(posts))
	for i, post := range posts {
		formattedPosts[i] = gin.H{
			"id":           post.ID,
			"title":        post.Title,
			"text":         post.Text,
			"hashtages":    post.Hashtages,
			"public":       post.Public,
			"scheduled_at": post.ScheduledAt.Unix(),
			"created_at":   post.CreatedAt.Unix(),
			"updated_at":   post.UpdatedAt.Unix(),
			"author_id":    post.AuthorID,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"count": len(posts),
		"posts": formattedPosts,
	})
}

// ------------------------------GET/post/shared------------------------------//

func GetSharePost(c *gin.Context) {

	uuid := c.Query("uuid")
	if uuid == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "UUID parameter is required",
		})
		return
	}

	var share models.Share
	if err := database.DB.Where("uuid = ? AND expires_at > ?", uuid, time.Now()).First(&share).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusForbidden, gin.H{})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Database error",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, share.PostID).Error; err != nil {
		c.JSON(http.StatusForbidden, gin.H{})
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
		"hashtages":    post.Hashtages,
	})
}

// ------------------------------GET/post/shared/includes------------------------------//

func GetSharedPostIncludes(c *gin.Context) {

	shareUUID := c.Query("uuid")
	if shareUUID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Share UUID is required",
		})
		return
	}

	if _, err := uuid.Parse(shareUUID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid share UUID format",
		})
		return
	}

	var share models.Share
	if err := database.DB.Where("uuid = ?", shareUUID).First(&share).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusForbidden, gin.H{
				"message": "Shared post not found or expired",
			})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"message": "Database error",
			})
		}
		return
	}

	if time.Now().After(share.ExpiresAt) {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Share link has expired",
		})
		return
	}

	var post models.Post
	if err := database.DB.First(&post, share.PostID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
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

	var includes []models.Include
	if err := database.DB.Where("post_id = ?", share.PostID).Find(&includes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to get includes",
			"error":   err.Error(),
		})
		return
	}

	if len(includes) == 0 {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "No includes found for this post",
		})
		return
	}

	response := make([]gin.H, len(includes))
	for i, include := range includes {
		response[i] = gin.H{
			"id":       include.ID,
			"link":     include.Data,
			"filename": include.Type,
			"size":     include.Size,
		}
	}

	c.JSON(http.StatusOK, response)
}
