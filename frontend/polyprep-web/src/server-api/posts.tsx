import axios from "axios";
import { validateTokens } from "./auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface IPost {
  id?: number;
  created_at?: number;
  updated_at?: number;
  scheduled_at?: number | null;
  author_id?: string;
  title: string;
  text: string;
  public: boolean;
  hashtages: string[];
}
  
export async function postPost(data: IPost) {
  try {
    await validateTokens();
    
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post`, data,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getPost(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
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

export async function getRandomPosts(count: number) {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post/random?count=${count}`,
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

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deletePost(post_id: number) {
  try {
    await validateTokens();
    
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }}
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}