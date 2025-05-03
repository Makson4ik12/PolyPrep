import store from "../redux-store/store";
import axios from "axios";
import { IToken, ITokens, setStateLogin, setStateLogout } from "../redux-store/user-auth";
import { SERVER_ADDRESS, SERVER_API_VERSION } from "./config";
import { jwtDecode } from "jwt-decode";

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
      await axios.post(
        `${SERVER_ADDRESS}${SERVER_API_VERSION}auth/logout`, { access_token: tokens.access_token, refresh_token: tokens.refresh_token, next_page: ""}
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

export const authUpdateToken = async () => {
  try {
    const response = await axios.post(`${SERVER_ADDRESS}${SERVER_API_VERSION}auth/refresh`, {refresh_token: store.getState().auth.authTokens.refresh_token});
    const data = response.data as ITokens;
    store.dispatch(setStateLogin({ access_token: data.access_token, refresh_token: data.refresh_token }));
  } catch (error: any) {
    store.dispatch(setStateLogout());
    throw error;
  }
}

export const validateTokens = async () => {
  const tokens = store.getState().auth.authTokens;

  if (tokens.refresh_token !== null){
    const isExpiredAccess = Date.now() >= ((jwtDecode(tokens.access_token as string) as IToken).exp * 1000);

    if (isExpiredAccess) {
      const isExpiredRefresh = Date.now() >= ((jwtDecode(tokens.refresh_token as string) as IToken).exp * 1000);

      if (!isExpiredRefresh) {
        try {
          const resp = await authUpdateToken();
        } catch (error: any) {
          store.dispatch(setStateLogout())
          throw error;
        }
      } else {
        store.dispatch(setStateLogout());
        throw new Error("Tokens not valide");
      }
    } else {
      return true;
    }
  } else {
    throw new Error("Tokens are empty");
  }
}