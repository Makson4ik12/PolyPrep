import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import store from "../redux-store/store";
import { authCallback, authCheck } from "../server-api/auth";


export const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    searchParams.get("p") ?
      (async () => {
        await authCallback(Number(searchParams.get("p") || null))
        .catch((err) => console.log(err));
      }) ()
    :
      (async () => {
        await authCheck()
        .then((resp) => resp.redirect ? window.location.href = resp.url : console.log("redirect = NULL"))
        .catch((err) => console.log(err));
      }) ();
  }, []);

  return (
    <>
    </>
  )
}

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
        <Navigate to={"/IAMLOGGENEDIN"} replace={true} />
      :
        <Navigate to={"/login"} replace={true} />
    }
    </>

  );
}

export default UserPage;
