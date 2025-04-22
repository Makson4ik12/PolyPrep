// уxport async function getFavourites() {
//     try {
//       await validateTokens();

import axios from "axios";
import { validateTokens } from "./auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

  
//       const response = await axios.get(
//       `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite/`, 
//       { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access}` } }
//       );
//       return response;
//     } catch (error: any) {
//       throw error;
//     }
//   }
  
//   export async function checkProductInFavourites(product_id: number) {
//     try {
//       await validateTokens();
  
//       const response = await axios.get(
//       `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite/check?product_id=${product_id}`, 
//       { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access}` } }
//       );
//       return response;
//     } catch (error: any) {
//       throw error;
//     }
//   }
  
//   export async function deleteFavourite(product_id: number) {
//     try {
//       await validateTokens();
  
//       const response = await axios.delete(
//       `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite/`,
//       { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access}` }, 
//         data: { id: product_id } 
//       }
//       );
  
//       const prev_favourites_count = store.getState().auth.userData.favourites;
//       store.dispatch(setUserData({favourites: prev_favourites_count - 1}))
  
//       return response;
//     } catch (error: any) {
//       throw error;
//     }
//   }

interface IPost {
  id?: number;
  created_at?: number;
  updated_at?: number;
  scheduled_at?: number | null;
  author_id?: number;
  title: string;
  text: string;
  public: boolean;
  hashtages: string[];
}
  
export async function postPost(data: IPost) {
  try {
    await validateTokens();
    
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post/`, data,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}

export async function getPost(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }, params: { id: post_id } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getPosts() {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}user/posts`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function putPost(data: IPost) {
  try {
    await validateTokens();
    
    const response = await axios.put(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post`, data,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}

export async function deletePost(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post/`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }, params: { id: post_id } }
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}