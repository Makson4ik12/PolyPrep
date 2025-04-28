import axios from "axios";
import { validateTokens } from "./auth";
import { IPost } from "./posts";
import store from "../redux-store/store";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";

export interface IShare {
  id?: number;
  post_id: number;
  expires_at: number;
}

export interface IShareLink {
  uuid: string;
  expires_at: number;
}

export async function postShareLink(data: IShare) {
  try {
    await validateTokens();
    
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}shared`, data,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getSharedLink(post_id: number) {
  try {
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}shared?id=${post_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteSharedLink(uuid: string) {
  try {
    await validateTokens();
    
    const response = await axios.delete(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}shared?uuid=${uuid}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }}
    );

    return response;
  } catch (error: any) {
    throw error;
  }
}