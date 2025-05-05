import Loader from "../components/Loader";
import { useSearchParams } from "react-router-dom";
import { authCallback, authCheck, validateTokens } from "../server-api/auth";
import { JSX, useEffect, useState } from "react";

interface IProtectedPage {
  page: JSX.Element
  next_page: string
}

const LoginPage = (params: IProtectedPage) => {
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
        await validateTokens()
        .then((resp) => setIsLoading(false))
        .catch((err) => {
          (async () => {
            await authCheck(params.next_page)
            .then((resp) => resp.redirect ? window.open(resp.url, "_self") : setIsLoading(false))
            .catch((err) => console.log(err));
          }) ();
        });
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

export default LoginPage;