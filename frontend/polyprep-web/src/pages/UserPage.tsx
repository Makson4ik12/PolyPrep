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
import { useQuery } from "@tanstack/react-query";
import { KEYCLOAK_ADDRESS } from "../server-api/config";

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

const fetchUserPosts = async () => {
  const resp = await getPosts();
  const _user_posts = resp as IPost[];
  _user_posts.sort((item1, item2) => (item2?.created_at as number) - (item1?.created_at as number));

  return _user_posts;
};

const fetchFavouritePosts = async () => {
  const resp = await getFavouritePosts();
  const _fav_posts = resp as IFavourite[];
  _fav_posts.sort((item1, item2) => (item2?.id as number) - (item1?.id as number));

  return _fav_posts;
};

// # TODO:  добавить сылку на редактирование - keycloak; 
// изменить стили для markdown
// добавить в 2 строки имя и дата поста при просмотре поста [mobile]

const UserPage = () => {
  const current_state = store.getState().auth;
  const location = useLocation();

  const [viewFavourites, setViewFavourites] = useState(true);
  const [viewMyPosts, setViewMyPosts] = useState(true);

  const { data: userPosts, isLoading: loadingPosts, error: errLoadUserPosts } = useQuery({
    queryKey: ['userpage-userPosts'],
    queryFn: fetchUserPosts,
    staleTime: 5 * 60 * 1000,
  });

  const { data: favouritePosts, isLoading: loadingFavourite, error: errLoadFavouritePosts } = useQuery({
    queryKey: ['userpage-favouritePosts'],
    queryFn: fetchFavouritePosts,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, loadingPosts, loadingFavourite]);
  
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

          <button onClick={() => window.open(`${KEYCLOAK_ADDRESS}realms/master/account`, "_blank")}>
            <p>Редактировать</p>
          </button>
        </div>
      </div>
      
      <div id="favourite-posts" className={styles.title_razdel} onClick={() => setViewFavourites(prev => !prev)}>
        <h2>Избранное</h2>
        <img src={!viewFavourites ? IconArrowDown : IconArrowUp} alt='arrow' />
      </div>

      {
        loadingFavourite ? 
          <Loader />
        :
          (favouritePosts?.length === 0 || (errLoadFavouritePosts != null)) ? <p>У вас нет избранных постов :(</p>
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
        loadingPosts ?
          <Loader />
        :
          ((userPosts?.length === 0) || (errLoadUserPosts != null)) ? <p>У вас еще нет постов</p>
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
