import styles from '../pages/ViewPostPage.module.scss'

import Modal from 'react-responsive-modal';
import ViewUserProfile from './modals/ViewUserProfile';
import store from '../redux-store/store';
import TextareaAutosize from 'react-textarea-autosize';
import HandleResponsiveView, { screenSizes } from '../utils/ResponsiveView';
import { useRef, useState } from 'react';
import { deleteComment, IComment, putComment } from '../server-api/comments';
import {  IUser } from '../server-api/user';
import { getDate, getImgLink } from '../utils/UtilFunctions';
import { fetchUserData } from './Header';
import { useQuery } from '@tanstack/react-query';
import { MiniLoader } from './Loader';

import IconCancel from '../icons/delete.svg'
import IconSuccess from '../icons/success.svg'
import IconUser from '../icons/user.svg'
import IconEdit from '../icons/edit.svg'
import IconDelete from '../icons/trash.svg'

interface ICommentMeta {
  setIsLoading: (val: boolean) => void;
  updateComments: () => void;
}

const Comment = (data: IComment & ICommentMeta) => {
  const userData = store.getState().auth.userData;

  const [value, setValue] = useState(data.text);
  const [isEdit, setIsEdit] = useState(false);
  const [viewUserProfile, setViewUserProfile] = useState<boolean>(false);
  
  const screenSize = HandleResponsiveView();
  const commentRef = useRef<HTMLTextAreaElement>(null);

  const handleOnDelete = async () => {
    data.setIsLoading(true);

    await deleteComment(data.id || -1)
    .then((resp) => {
      data.updateComments();
    })
    .catch((error) => console.log("cannot delete post"));

    data.setIsLoading(false);
  }

  const handleCommentChange = (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = evt.target?.value;
    setValue(val);
  };

  const handleOnEdit = async () => {
    if (commentRef.current?.value.length == 0) {
      setValue(data.text);
      return;
    }

    await putComment({
      id: data.id,
      text: commentRef.current?.value || data.text,
      post_id: data.post_id
    })
    .then ((resp) => {
      setValue(commentRef.current?.value || data.text);
      setIsEdit(false);
    })
    .catch((error) => { 
      setIsEdit(false);
      console.log("comment not updated");
    });
  }

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['user-' + data.author_id + '-image'],
    queryFn: () => fetchUserData(data.author_id || "-1"),
    staleTime: 5 * 60 * 1000
  });

  return (
    <div className={styles.info_container}>
      <div className={styles.top_info}>
        <div className={styles.user_info} onClick={() => setViewUserProfile(true)}>
          {
            isLoadingUser ? <MiniLoader />
            :
              <img className={styles.user_icon} src={(((user as IUser).img_link != "") ? getImgLink((user as IUser).img_link || "1") : IconUser)} alt='usericon'/>
          }
          
          <p>
            <b>{ data?.author_id === userData.uid ? "You" : user?.username }</b>{screenSize.width <= screenSizes.__320.width ? <br></br> : " | "}{ getDate(data.created_at || 0) }
          </p>
        </div>

        {
          data?.author_id === userData.uid ?
            <div className={styles.lin_container}>
              {
                isEdit ? 
                  <>
                    <img src={IconCancel} alt='cancel' className={styles.action_btn} onClick={() => setIsEdit(false)}/>
                    <img src={IconSuccess} alt='success' className={styles.action_btn} onClick={() => handleOnEdit()}/>
                  </>
                :
                  <>
                    <img src={IconEdit} alt='edit' className={styles.action_btn} onClick={() => setIsEdit(true)}/>
                    <img src={IconDelete} alt='delete' className={styles.action_btn} onClick={() => handleOnDelete()}/>
                  </>
              }
            </div>
          :
            <></>
        }
        
      </div>
      
      {
        isEdit ? 
          <form>
            <TextareaAutosize 
              id="edit-comment" 
              name="comment" 
              placeholder='Крутой конспект!' 
              maxLength={350}
              required
              ref={commentRef}
              onChange={handleCommentChange}
              spellCheck={false}
              defaultValue={value}
              autoCapitalize='on'
            />
          </form>
        :
          <p className={styles.text}>{value}</p>
      }

      <Modal 
        open={viewUserProfile} 
        onClose={() => setViewUserProfile(false)} 
        showCloseIcon={true} 
        animationDuration={400}
        blockScroll={true}
        center
      >
        <ViewUserProfile 
          id={user?.id || "-1"}
          username={user?.username|| "-1"}
          img_link={user?.img_link|| ""}
          onClose={() => setViewUserProfile(false)}
        />
      </Modal>
    </div>
  )
}

export default Comment;