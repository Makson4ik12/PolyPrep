import axios from "axios";
import { validateTokens } from "./auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface IFavourite {
  id: number;
  created_at: number;
  post_id: number;
}
  
export async function postFavourite(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite`, { post_id: post_id},
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function checkPostIsFavourite(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite/check?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getFavouritePosts() {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteFavourite(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.delete(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}favourite?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }}
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}