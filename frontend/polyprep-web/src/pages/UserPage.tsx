import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import store from "../redux-store/store";
import { current } from "@reduxjs/toolkit";

const UserPage = () => {
  const [tokens, setTokens] = useState(false);
  const current_state = store.getState().auth;

  useEffect(() => {
    if (current_state.authTokens.refresh !== null)
      setTokens(true);
  }, []);
  
  return (
    <>
    {
      tokens ? 
        <h1>I AM LOGGED IN - {current_state.userData.user_mail}</h1>
      :
        <Navigate to={"/login"} replace={true} />
    }
    </>
  );
}

export default UserPage;
