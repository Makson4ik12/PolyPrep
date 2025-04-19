import store from "../redux-store/store";
import axios from "axios";
import { ITokens, setStateLogin, setStateLogout } from "../redux-store/user-auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";

interface IAuthCheckResponse {
  url: string;
  redirect: boolean;
}

export const authCheck = async (next_page: string) => {
  const tokens = store.getState().auth.authTokens;

  try {
      const response = await axios.post(
        `${SERVER_ADDRESS}${SERVER_API_VERSION}auth/check`, { ...tokens, next_page: next_page }
      );
  
      return response.data as IAuthCheckResponse;
    } catch (error: any) {
      throw error;
    }
}

export const authLogout = async () => {
  const tokens = store.getState().auth.authTokens;

  try {
      const response = await axios.post(
        `${SERVER_ADDRESS}${SERVER_API_VERSION}auth/logout`, tokens
      );
  
      store.dispatch(setStateLogout());
    } catch (error: any) {
      throw error;
    }
}

export const authCallback = async (code: string, next_page: string) => {
  try {
      const response = await axios.get(
        `${SERVER_ADDRESS}${SERVER_API_VERSION}auth/callback`, 
        {
          params: {
            code: code,
            next_page: next_page
          }
        }
      );

      store.dispatch(setStateLogin(response.data as ITokens))
    } catch (error: any) {
      throw error;
    }
}