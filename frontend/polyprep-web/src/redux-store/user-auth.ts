import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { jwtDecode } from 'jwt-decode';

export interface IToken {
  exp: number;
  given_name: string;
  family_name: string;
  email: string;
  email_verified: boolean;
  preferred_username: string;
  sub: string;
}

export interface ITokens{
  refresh_token: string | null;
  access_token: string | null;
}

interface IUserData {
  user_mail: string | null;
  first_name: string | null;
  last_name: string | null;
  email_verified: boolean | null;
  preferred_username: string | null;
  uid: string | null;
}

interface IAuthState {
  authTokens: ITokens;
  userData: IUserData;
}
  
const initialState: IAuthState = {
  authTokens: localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens') as string) : { refresh_token: null, access_token: null },
  userData: {
    user_mail: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access_token) as IToken)?.email : null, 
    first_name: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access_token) as IToken)?.given_name : null,
    last_name: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access_token) as IToken)?.family_name : null,
    email_verified: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access_token) as IToken)?.email_verified : null,
    preferred_username: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access_token) as IToken)?.preferred_username : null,
    uid: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access_token) as IToken)?.sub : null
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setStateLogin: (state, data: {payload: ITokens, type: any}) => {
      state.userData = {
        user_mail: (jwtDecode(data.payload.access_token as string) as IToken).email,
        first_name: (jwtDecode(data.payload.access_token as string) as IToken).given_name,
        last_name: (jwtDecode(data.payload.access_token as string) as IToken).family_name,
        email_verified: (jwtDecode(data.payload.access_token as string) as IToken).email_verified,
        preferred_username: (jwtDecode(data.payload.access_token as string) as IToken).preferred_username,
        uid: (jwtDecode(data.payload.access_token as string) as IToken).sub
      };
      state.authTokens = data.payload;
      localStorage.setItem('authTokens', JSON.stringify(data.payload));
    },
    setStateLogout: (state) => {
      state.userData = {
        user_mail: null,
        first_name: null,
        last_name: null,
        email_verified: null,
        preferred_username: null,
        uid: null
      };
      state.authTokens = {refresh_token: null, access_token: null};
      localStorage.removeItem('authTokens');
    }
  },
})

export const { setStateLogin, setStateLogout } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;