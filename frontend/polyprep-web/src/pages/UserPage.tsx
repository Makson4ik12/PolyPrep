import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import store from "../redux-store/store";
import { current } from "@reduxjs/toolkit";

const UserPage = () => {
  const current_state = store.getState().auth;
  
  return (
    <>
      <h1>I AM LOGGED IN - {current_state.userData.user_mail}</h1>
    </>
  );
}

export default UserPage;
