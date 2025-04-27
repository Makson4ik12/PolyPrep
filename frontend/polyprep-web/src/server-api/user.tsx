import axios from "axios";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import store from "../redux-store/store";

export interface IUser {
    id: number;
    username: string;
    icon: string;
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