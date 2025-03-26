import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './store';
import { jwtDecode } from 'jwt-decode';

export interface IToken {
  exp: number;
  given_name: string;
  family_name: string;
  email: string;
}

export interface ITokens{
  refresh: string | null;
  access: string | null
}

interface IUserData {
  user_mail: string | null;
  first_name: string | null;
  last_name: string | null;
}

interface IAuthState {
  authTokens: ITokens;
  userData: IUserData
}
  
const initialState: IAuthState = {
  authTokens: localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens') as string) : { refresh: null, access: null },
  userData: {
    user_mail: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access) as IToken)?.email : null, 
    first_name: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access) as IToken)?.given_name : null,
    last_name: localStorage.getItem('authTokens') ? (jwtDecode(JSON.parse(localStorage.getItem('authTokens') as string).access) as IToken)?.family_name : null
  }
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setStateLogin: (state, data: {payload: ITokens, type: any}) => {
      state.userData = {
        user_mail: (jwtDecode(data.payload.access as string) as IToken).email,
        first_name: (jwtDecode(data.payload.access as string) as IToken).given_name,
        last_name: (jwtDecode(data.payload.access as string) as IToken).family_name,
      };
      state.authTokens = data.payload;
      localStorage.setItem('authTokens', JSON.stringify(data.payload));
    },
    setStateLogout: (state) => {
      state.userData = {
        user_mail: null,
        first_name: null,
        last_name: null
      };
      state.authTokens = {refresh: null, access: null};
      localStorage.removeItem('authTokens');
    }
  },
})

export const { setStateLogin, setStateLogout } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;