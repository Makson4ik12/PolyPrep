import axios from "axios";
import { validateTokens } from "./auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface IComment {
  id? : number;
  created_at?: number;
  updated_at?: number;
  author_id?: string;
  post_id: number;
  text: string;
}
  
export async function postComment(comment: IComment) {
  try {
    await validateTokens();
    
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}comment`, comment,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function putComment(comment: IComment) {
  try {
    await validateTokens();
    
    const response = await axios.put(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}comment`, comment,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getPostComments(comment_id: number) {
  try {
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}comment?id=${comment_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteComment(comment_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.delete(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}comment?id=${comment_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }}
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}