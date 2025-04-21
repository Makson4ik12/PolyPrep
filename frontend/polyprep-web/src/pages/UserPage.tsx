import styles from "./UserPage.module.scss"
import store from "../redux-store/store";
import IconUser from '../icons/user.svg'
import IconMail from '../icons/mail.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import Card from "../components/Card";
import React, { useState } from "react";

const UserPage = () => {
  const current_state = store.getState().auth;

  const [viewFavourites, setViewFavourites] = useState(true);
  const [viewMyPosts, setViewMyPosts] = useState(true);
  
  return (
    <div className={styles.container}>
      <div className={styles.lin_container}>
        <img src={IconUser} alt='user' className={styles.user_image}></img>

        <div className={styles.data_container}>
          <div className={styles.title_container}>
            <img src={IconUser} alt='username' />
            <h2 className={styles.title}>{current_state.userData.preferred_username ? current_state.userData.preferred_username : "Tuzik"}</h2>
          </div>

          <div className={styles.title_container}>
            <img src={IconMail} alt='mail' />
            <h2 className={styles.title}>{ current_state.userData.user_mail ? current_state.userData.user_mail : "somemail@mail.com"}</h2>
          </div>

          <button>
            <p>Редактировать</p>
          </button>
        </div>
      </div>

      <div className={styles.title_razdel} onClick={() => setViewFavourites(prev => !prev)}>
        <h2>Избранное</h2>
        <img src={!viewFavourites ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>
      
      <div className={viewFavourites ? styles.cards_container : styles.cards_container_hidden}>
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так.Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так.Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно' 
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
      </div>

      <div className={styles.title_razdel} onClick={() => setViewMyPosts(prev => !prev)}>
        <h2>Ваши посты</h2>
        <img src={!viewMyPosts ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>

      <div className={viewMyPosts ? styles.cards_container : styles.cards_container_hidden}>
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
        <Card 
          id={1}
          created_at={1745160699283}
          updated_at={1745160699283}
          scheduled_at={1745160699283}
          author_id={1745160699283}
          title='Конспекты по кмзи от Пупки Лупкиной' 
          text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
          public={true}
          hashtages={["#hype", "#math", "#hochy5"]}
        />
      </div>
    </div>
  );
}

export default UserPage;
