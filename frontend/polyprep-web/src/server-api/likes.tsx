import axios from "axios";
import { validateTokens } from "./auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface ILike {
  id: number;
  created_at: number;
  user_id: string;
  post_id: number;
}

export interface ILikes {
  count: number;
  likes: ILike[];
  post_id: number;
  created_at: number;
}
  
export async function postLike(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}like`, { post_id: post_id},
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getPostLikes(post_id: number) {
  try {
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}like?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteLike(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.delete(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}like?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }}
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}