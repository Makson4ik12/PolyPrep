import { useEffect, useState } from "react";
import { getTextColor } from "../utils/UtilFunctions";
import styles from "./Badge.module.scss"

interface IBadge {
  text: string;
  icon?: string
}

export function Badge (data: IBadge) {
  const [colors, setColors] = useState<{bgColor: string, textColor: string}>({bgColor: "white", textColor: "black"});

  useEffect(() => {
    const bgColor = "#" + ((1 << 24) * Math.random() | 0).toString(16).padStart(6, "0");
    setColors({bgColor: bgColor, textColor: getTextColor(bgColor)});
  }, []);

  return (
    <div className={styles.badge} style={{backgroundColor: "white"}}>
      {
        data.icon ? <img src={data.icon} alt='icon'/> : <></>
      }
      <p style={{color: "black"}}>{data.text}</p>
    </div>
  )
}