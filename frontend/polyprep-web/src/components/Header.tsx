import styles from './Header.module.scss'
import { Link } from 'react-router-dom';
import IconUser from '../icons/user.svg'
import IconSearch from '../icons/search.svg'
import IconCreate from '../icons/create.svg'
import store from '../redux-store/store';

const Header = () => {
  const userdata = store.getState().auth.userData;
  
  return (
    <header className={styles.header_style}>
      <div className={styles.container} >
        <Link to="/">
          <h1>PolyPrep &lt;&lt;</h1>
        </Link>

        <div className={styles.menu} >
          <div className={styles.menu_item_link}>
            <Link to="/search">
              <img src={IconSearch} alt='search' />
              <p>Поиск</p>
            </Link>
          </div>
          
          <div className={styles.menu_item_link} >
            <Link to="/post/new">
              <img src={IconCreate} alt='create' />
              <p>Новый пост</p>
            </Link>
          </div>
        </div>

        <div className={styles.user}>
          <Link to="/user">
            <p> { userdata.preferred_username ? userdata.preferred_username : "Вход" }</p>
            <img src={IconUser} alt='user' />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header;