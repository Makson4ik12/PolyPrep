import styles from "./UserPage.module.scss"
import cardStyles from '../components/Card.module.scss'

import store from "../redux-store/store";
import Card from "../components/Card";
import ChangeUserImage from "../components/modals/ChangeUserImage";
import Modal from "react-responsive-modal";
import Loader from "../components/Loader";
import Masonry from "react-layout-masonry";
import { useEffect, useState } from "react";
import { getPost, getPosts, IPost } from "../server-api/posts";
import { getFavouritePosts, IFavourite } from "../server-api/favourites";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { KEYCLOAK_ADDRESS } from "../server-api/config";
import { useAppSelector } from "../redux-store/hooks";
import { fetchUserData } from "../components/Header";
import { getImgLink } from "../utils/UtilFunctions";
import { setViewFavourite, setViewUserPosts } from "../redux-store/user-settings";
import { authLogout } from "../server-api/auth";

import IconUser from '../icons/user.svg'
import IconMail from '../icons/mail.svg'
import IconArrowDown from '../icons/arrow_down.svg'
import IconArrowUp from '../icons/arrow_up.svg'
import IconEdit from '../icons/edit.svg'
import IconExit from '../icons/exit.svg'

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

const UserPage = () => {
  const current_state = store.getState().auth;
  const location = useLocation();
  const navigate = useNavigate();

  const uid = useAppSelector((state) => state.auth.userData.uid);
  const viewFavourites = useAppSelector((state) => state.settings.viewFavourite);
  const viewMyPosts = useAppSelector((state) => state.settings.viewUserPosts);

  const [viewChangeImage, setViewChangeImage] = useState(false);

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

  const { data: userData, isLoading: loadingData, error } = useQuery({
    queryKey: ['user-' + uid + '-image'],
    queryFn: () => fetchUserData(uid || "-1"),
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location, loadingPosts, loadingFavourite]);
  
  const handleOnLogout = async () => {
    await authLogout()
      .then((resp) => {
        navigate("/");
      })
      .catch((error) => console.log("cannot logout"));
  }

  return (
    <div className={styles.container}>
      <div className={styles.lin_container}>
        {
          loadingData ? <Loader />
          :
            <>
              <img src={((userData?.img_link != "") ? getImgLink(userData?.img_link || "") : IconUser)} alt='user' className={styles.user_image} onClick={() => setViewChangeImage(true)}></img>

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
                  <img src={IconEdit} alt='edit' />
                  <p>Редактировать</p>
                </button>

                <button className={styles.outline_button} onClick={() => handleOnLogout()}>
                  <img src={IconExit} alt='exit' />
                  <p>Выйти из аккаунта</p>
                </button>
              </div>
            </> 
        }
      </div>
      
      <div 
        id="favourite-posts" 
        className={styles.title_razdel} 
        onClick={() => {
          store.dispatch(setViewFavourite(!viewFavourites));
        }}
      >
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

      <div 
        id="my-posts" 
        className={styles.title_razdel} 
        onClick={() => {
          store.dispatch(setViewUserPosts(!viewMyPosts));
        }}
      >
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

      <Modal 
        open={viewChangeImage} 
        onClose={() => setViewChangeImage(false)} 
        showCloseIcon={true} 
        animationDuration={400}
        blockScroll={true}
        center
      >
        <ChangeUserImage 
          onClose={() => setViewChangeImage(false)}
        />
      </Modal>
    </div>
  );
}

export default UserPage;
