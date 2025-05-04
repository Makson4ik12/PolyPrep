import axios from "axios";
import { validateTokens } from "./auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface IInclude {
  link: string;
  id: number;
  filename: string;
  size: number;
}

interface IpostInclude {
  File: File;
  Filename: string;
  PostId: number;
}

export async function getPostIncludes(post_id: number) {
  try {
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}includes?id=${post_id}`,
		{ headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` }}
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function getSharedIncludes(uuid: string) {
  try {
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}post/shared/includes?uuid=${uuid}`
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function postInclude(data: IpostInclude) {
  try {
    await validateTokens();

    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}includes?filename=${data.Filename}&post_id=${data.PostId}`, data.File,
    { headers: 
      { 
        Authorization: `Bearer ${store.getState().auth.authTokens.access_token}`,
       'Content-Type': 'multipart/form-data'
      } 
    }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function deleteInclude(id: number) {
  try {
    await validateTokens();

    const response = await axios.delete(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}includes?id=${id}`,
    { headers: 
      { 
        Authorization: `Bearer ${store.getState().auth.authTokens.access_token}`,
      } 
    }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}