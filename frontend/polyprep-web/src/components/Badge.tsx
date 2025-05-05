import styles from "./Badge.module.scss"

import { useNavigate } from "react-router-dom";

interface IBadge {
  text: string;
  icon?: string
}

export function Badge (data: IBadge) {
  const navigate = useNavigate();

  return (
    <div className={styles.badge} onClick={ () => navigate("/search?q=" + data.text.slice(1, data.text.length)) }>
      {
        data.icon ? <img src={data.icon} alt='icon'/> : <></>
      }
      <p>{data.text}</p>
    </div>
  )
}