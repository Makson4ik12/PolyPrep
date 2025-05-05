import styles from './Header.module.scss'
import "./modals/GlobalModalsStyles.css"

import Modal from 'react-responsive-modal';
import MobileHeader from './modals/MobileHeader';
import { Link } from 'react-router-dom';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import { useState } from 'react';
import { useAppSelector } from '../redux-store/hooks';
import { useQuery } from '@tanstack/react-query';
import { getUser, IUser } from '../server-api/user';
import { MiniLoader } from './Loader';
import { getImgLink } from '../utils/UtilFunctions';

import IconUser from '../icons/user.svg'
import IconSearch from '../icons/search.svg'
import IconCreate from '../icons/create.svg'
import IconMenu from '../icons/text.svg'

export const fetchUserData = async (uid: string) => {
  const resp = await getUser(uid) as IUser;
  return { id: resp.id, username: resp.username, img_link: getImgLink(resp.img_link)};
};

const Header = () => {
  const userFirstName = useAppSelector(data => data.auth.userData.first_name);
  const userLastName = useAppSelector(data => data.auth.userData.last_name);
  const uid = useAppSelector((state) => state.auth.userData.uid);

  const screenSize = HandleResponsiveView();
  const [viewMobileMenu, setViewMobileMenu] = useState(false);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['user-' + uid + '-image'],
    queryFn: () => fetchUserData(uid || "-1"),
    staleTime: 5 * 60 * 1000,
    enabled: !!uid
  });
  
  return (
    <header className={styles.header_style}>
      <div className={styles.container} >
        <Link to="/">
          <h1>polyprep</h1>
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
                {
                  isLoading ? <MiniLoader />
                  :
                    <>
                      <Link to="/user">
                        <p> { userFirstName && userLastName ? userFirstName + " " + userLastName : "Вход" }</p>
                        <img className={styles.user_icon} src={((userData && userData?.img_link != "") ? userData?.img_link : IconUser)} alt='user' />
                      </Link>
                    </>
                }
                
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
        blockScroll={true}
      >
        <MobileHeader 
          onClose={() => setViewMobileMenu(false)}
        />
      </Modal>

    </header>
  )
}

export default Header;