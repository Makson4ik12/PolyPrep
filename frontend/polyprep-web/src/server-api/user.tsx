import axios from "axios";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface IUser {
    id: string;
    username: string;
    img_link: string;
}

export async function getUser(user_id: string) {
  try {
    const response = await axios.get(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}user?id=${user_id}`,
    { headers: { Authorization: `Bearer ${store.getState().auth.authTokens.access_token}` } }
    );

    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export async function postUserImage(formData: FormData) {
  try {
    const response = await axios.post(
    `${SERVER_ADDRESS}${SERVER_API_VERSION}user/photo`, formData,
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