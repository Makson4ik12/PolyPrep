import { useNavigate, useSearchParams } from "react-router-dom";
import { authCallback, authCheck } from "../server-api/auth";
import { useEffect } from "react";

export const LoginPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
  
    useEffect(() => {
      if (searchParams.get("code")) {
        (async () => {
          await authCallback(searchParams.get("code") || "abc")
          .then (() => navigate("/user"))
          .catch((err) => console.log(err));
        }) ();
  
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