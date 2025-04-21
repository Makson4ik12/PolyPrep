import styles from './Header.module.scss'
import "./modals/GlobalModalsStyles.css"
import { Link } from 'react-router-dom';
import IconUser from '../icons/user.svg'
import IconSearch from '../icons/search.svg'
import IconCreate from '../icons/create.svg'
import IconMenu from '../icons/text.svg'
import store from '../redux-store/store';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import { useState } from 'react';
import Modal from 'react-responsive-modal';
import MobileHeader from './modals/MobileHeader';

const Header = () => {
  const userdata = store.getState().auth.userData;
  const screenSize = HandleResponsiveView();
  const [viewMobileMenu, setViewMobileMenu] = useState(false);
  
  return (
    <header className={styles.header_style}>
      <div className={styles.container} >
        <Link to="/">
          <h1>PolyPrep &lt;&lt;</h1>
        </Link>

        {
          screenSize.width > screenSizes.__768.width ?
            <>
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
            </>
          :
            <>
              <img src={IconMenu} alt='menu' className={styles.mobile_menu_btn} onClick={() => setViewMobileMenu(true)}/>
            </>
        }
        
      </div>

      <Modal 
        open={viewMobileMenu} 
        onClose={() => setViewMobileMenu(false)} 
        showCloseIcon={false} 
        classNames={{
          modal: "mobile_menu_container",
          modalAnimationIn: 'customEnterModalAnimation',
          modalAnimationOut: 'customLeaveModalAnimation'
        }}
        animationDuration={400}
        blockScroll={false}
      >
        <MobileHeader 
          onClose={() => setViewMobileMenu(false)}
        />
      </Modal>

    </header>
  )
}

export default Header;