import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { authCallback, authCheck } from "../server-api/auth";
import { JSX, useEffect, useState } from "react";
import Loader from "../components/Loader";

interface IProtectedPage {
  page: JSX.Element
  next_page: string
}

export const LoginPage = (params: IProtectedPage) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      if (searchParams.get("code")) {
        (async () => {
          await authCallback(searchParams.get("code") || "abc", params.next_page)
          .then(() => setIsLoading(false))
          .catch((err) => console.log(err));
        }) ();
      } else {
        (async () => {
          await authCheck(params.next_page)
          .then((resp) => resp.redirect ? window.open(resp.url, "_self") : setIsLoading(false))
          .catch((err) => console.log(err));
        }) ();
      }
    }, []);
  
    return (
      <>
      {
        isLoading ? 
          <Loader /> 
        :
          params.page
      }
      </>
    )
  }