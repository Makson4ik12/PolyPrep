import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import store from "../redux-store/store";

const UserPage = () => {
  const [tokens, setTokens] = useState(false);

  useEffect(() => {
    const tokens = store.getState().auth.authTokens;

    if (tokens.refresh !== null)
      setTokens(true);
  }, []);
  
  return (
    <>
    {
      tokens ? 
        <h1>I AM LOGGED IN </h1>
      :
        <Navigate to={"/login"} replace={true} />
    }
    </>
  );
}

export default UserPage;
