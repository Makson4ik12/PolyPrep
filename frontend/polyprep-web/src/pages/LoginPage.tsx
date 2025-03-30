import { useNavigate, useSearchParams } from "react-router-dom";
import { authCallback, authCheck } from "../server-api/auth";
import { useEffect } from "react";
import store from "../redux-store/store";
import { setStateLogin } from "../redux-store/user-auth";

export const LoginPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
  
    useEffect(() => {
      if (searchParams.get("code")) {
        (async () => {
          await authCallback(searchParams.get("code") || "abc")
          .catch((err) => console.log(err));
        }) ();
  
      } else if (searchParams.get("access") && searchParams.get("refresh")) {
        store.dispatch(setStateLogin({ access: searchParams.get("access") as string, refresh: searchParams.get("refresh") as string }))
        navigate("/user");

      } else {
        (async () => {
          await authCheck()
          .then((resp) => resp.redirect ? window.open(resp.url, "_self") : console.log("redirect = NULL"))
          .catch((err) => console.log(err));
        }) ();
      }
    }, []);
  
    return (
      <div>
        <h1>LOGINPAGE</h1>
      </div>
    )
  }