import styles from "./UserPage.module.scss"
import store from "../redux-store/store";
import IconUser from '../icons/user.svg'
import IconMail from '../icons/mail.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import Card from "../components/Card";
import React, { useEffect, useState } from "react";
import { getPost, getPosts, IPost } from "../server-api/posts";
import Loader from "../components/Loader";
import Masonry from "react-layout-masonry";
import cardStyles from '../components/Card.module.scss'
import { getFavouritePosts, IFavourite } from "../server-api/favourites";
import { useLocation } from "react-router-dom";

const FavouritePost = ( { post_id }: { post_id: number }) => {
  const [postData, setPostData] = useState<IPost>();

  useEffect(() => {
    (async () => {
      await getPost(post_id)
      .then((resp) => {
        setPostData(resp as IPost);
      })
      .catch((error) => console.log("cannot load post "));
    }) ()
  }, []);

  return (
    <>
      {
        postData ?
          <Card 
            key={postData.id}
            id={postData.id}
            created_at={postData.created_at}
            updated_at={postData.updated_at}
            scheduled_at={postData.scheduled_at}
            author_id={postData.author_id}
            title={postData.title} 
            text={postData.text}
            public={postData.public}
            hashtages={postData.hashtages}
          />
        :
          <></>
      }
    </>
  )
}

const UserPage = () => {
  const current_state = store.getState().auth;
  const location = useLocation();

  const [viewFavourites, setViewFavourites] = useState(true);
  const [viewMyPosts, setViewMyPosts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [userPosts, setUserPosts] = useState<IPost[]>([]);
  const [favouritePosts, setFavouritePosts] = useState<IFavourite[]>([]);

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, isLoading]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      await getPosts()
      .then((resp) => {
        setUserPosts(resp as IPost[]);
      })
      .catch((error) => console.log("cannot load user posts"));

      setIsLoading(false);
    }) ()
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);

      await getFavouritePosts()
      .then((resp) => {
        setFavouritePosts(resp as IFavourite[]);
      })
      .catch((error) => console.log("cannot load favourite posts"));

      setIsLoading(false);
    }) ()
  }, []);
  
  return (
    <div className={styles.container}>
      <div className={styles.lin_container}>
        <img src={IconUser} alt='user' className={styles.user_image}></img>

        <div className={styles.data_container}>
          <div className={styles.title_container}>
            <img src={IconUser} alt='username' />
            <h2 className={styles.title}>
              {
                current_state.userData.user_mail ? current_state.userData.first_name + " " + current_state.userData.last_name : "Unknown"
              }
            </h2>
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

      <div id="favourite-posts" className={styles.title_razdel} onClick={() => setViewFavourites(prev => !prev)}>
        <h2>Избранное</h2>
        <img src={!viewFavourites ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>
      
      {
        favouritePosts?.length === 0 ? <p>У вас нет избранных постов :(</p>
        :
          <Masonry
            columns={{640:1, 1200: 2}}
            gap={20}
            className={viewFavourites ? styles.cards_container : styles.cards_container_hidden}
            columnProps={{
              className: cardStyles.card_wrapper
            }}
          >
            {
              favouritePosts?.map((item) => 
                <FavouritePost 
                  key={item.id}
                  post_id={item.post_id || -1}
                />
              )
            }
          </Masonry>
        }

      <div id="my-posts" className={styles.title_razdel} onClick={() => setViewMyPosts(prev => !prev)}>
        <h2>Ваши посты</h2>
        <img src={!viewMyPosts ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>

      {
        isLoading ?
          <Loader />
        :
          userPosts?.length === 0 ? <p>У вас еще нет постов</p>
            :
              <Masonry
                columns={{640:1, 1200: 2}}
                gap={20}
                className={viewMyPosts ? styles.cards_container : styles.cards_container_hidden}
                columnProps={{
                  className: cardStyles.card_wrapper
                }}
              >
                {
                  userPosts?.map((item) => 
                    <Card 
                      key={item.id}
                      id={item.id}
                      created_at={item.created_at}
                      updated_at={item.updated_at}
                      scheduled_at={item.scheduled_at}
                      author_id={item.author_id}
                      title={item.title} 
                      text={item.text}
                      public={item.public}
                      hashtages={item.hashtages}
                    />
                  )
                }
              </Masonry>
        }
    </div>
  );
}

export default UserPage;
