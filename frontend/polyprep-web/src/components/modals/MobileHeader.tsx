import styles from '../modals/MobileHeader.module.scss'

import { Link } from 'react-router-dom';
import { useAppSelector } from '../../redux-store/hooks'
import { useQuery } from '@tanstack/react-query'
import { fetchUserData } from '../Header'
import { MiniLoader } from '../Loader'

import IconSearch from '../../icons/search.svg'
import IconCreate from '../../icons/create.svg'
import IconUser from '../../icons/user.svg'
import IconFavourite from '../../icons/favourite.svg'
import IconPosts from '../../icons/posts.svg'

interface IMobileHeader {
  onClose: () => void;
}

export default function MobileHeader(params: IMobileHeader) {
  const userFirstName = useAppSelector(data => data.auth.userData.first_name);
  const userLastName = useAppSelector(data => data.auth.userData.last_name);
  const uid = useAppSelector((state) => state.auth.userData.uid);
  
  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-' + uid + '-image'],
    queryFn: () => fetchUserData(uid || "-1"),
    staleTime: 5 * 60 * 1000,
    enabled: !!uid
  });
  
  return (
    <header className={styles.header_style}>
      <div className={styles.container}>
        <div className={styles.menu} >
          <div className={styles.menu_item_link}>
            <Link onClick={() => params.onClose()} to="/search">
              <img src={IconSearch} alt='search' />
              <p>Поиск</p>
            </Link>
          </div>
        </div>

        <div className={styles.menu} >
          <div className={styles.menu_item_link}>
            <Link onClick={() => params.onClose()} to="/user#my-posts">
              <img src={IconPosts} alt='my-posts' />
              <p>Мои посты</p>
            </Link>
          </div>

          <div className={styles.menu_item_link}>
            <Link onClick={() => params.onClose()} to="/user#favourite-posts">
              <img src={IconFavourite} alt='favourite' />
              <p>Избранное</p>
            </Link>
          </div>

          <div className={styles.menu_item_link_black} >
            <Link onClick={() => params.onClose()} to="/post/new">
              <img src={IconCreate} alt='create' />
              <p>Новый пост</p>
            </Link>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.user}>
          <Link onClick={() => params.onClose()} to="/user">
            <p> { userFirstName && userLastName ? userFirstName + " " + userLastName : "Вход" }</p>
            {
              isLoading ? <MiniLoader />
              :
                <img className={styles.user_icon} src={((userData && userData?.img_link != "") ? userData?.img_link : IconUser)} alt='user' />
            }
          </Link>
        </div>
      </div>
    </header>
  )
}