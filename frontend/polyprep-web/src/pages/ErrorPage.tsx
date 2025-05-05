import styles from "./ErrorPage.module.scss"

import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1>Ошибка 404</h1>
      <h2>Страница не найдена :(</h2>
      <button onClick={() => navigate("/")}><p>На главную</p></button>
    </div>
  )
}

export default ErrorPage;