package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
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
func GetFavorite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{ //200

	})
}

// ------------------------------POST/include-----------------------------//
func MakeFavorite(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{ //200

	})
}

// ------------------------------DELETE/include---------------------------//
func DeleteFromFavorite(c *gin.Context) {

	c.JSON(http.StatusOK, gin.H{ //200

	})
}
