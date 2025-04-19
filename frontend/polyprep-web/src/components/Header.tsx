import styles from './Header.module.scss'
import { Link } from 'react-router-dom';
import IconUser from '../icons/user.svg'
import IconSearch from '../icons/search.svg'
import IconCreate from '../icons/create.svg'

const Header = () => {
  return (
    <header className={styles.header_style}>
      <div className={styles.container} >
        <Link to="/">
          <h1>PolyPrep &lt;&lt;</h1>
        </Link>

        <div className={styles.menu} >
          <div className={styles.menu_item} >
            <img src={IconSearch} alt='search' />
            <p>Поиск</p>
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
            <p>Maks Pupkin</p>
            <img src={IconUser} alt='user' />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header;