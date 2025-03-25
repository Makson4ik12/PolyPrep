import styles from './Header.module.scss'
import { Link } from 'react-router-dom';
import IconUser from '../icons/user.svg'
import IconSearch from '../icons/search.svg'

const Header = () => {
  return (
    <header className={styles.header_style}>
      <div className={styles.container} >
        <Link to="/">
          <h1>PolyPrep</h1>
        </Link>

        <div className={styles.menu}>
          <Link to="/search">
            <img src={IconSearch} alt='search' />
          </Link>
          <Link to="/profile">
            <img src={IconUser} alt='user' />
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Header;