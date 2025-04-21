import styles from '../modals/MobileHeader.module.scss'
import IconSearch from '../../icons/search.svg'
import IconCreate from '../../icons/create.svg'
import IconUser from '../../icons/user.svg'
import { Link } from 'react-router-dom';
import store from '../../redux-store/store';

interface IMobileHeader {
  onClose: () => void;
}

export default function MobileHeader(params: IMobileHeader) {
  const userdata = store.getState().auth.userData;
  
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
            <p> { userdata.preferred_username ? userdata.preferred_username : "Вход" }</p>
            <img src={IconUser} alt='user' />
          </Link>
        </div>
      </div>
    </header>
  )
}