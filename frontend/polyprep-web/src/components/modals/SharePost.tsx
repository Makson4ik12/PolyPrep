import styles from '../modals/SharePost.module.scss'

import store from '../../redux-store/store';
import Loader from '../Loader';
import { IPost } from '../../server-api/posts'
import { useEffect, useState } from 'react';
import { deleteSharedLink, getSharedLink, IShareLink, postShareLink } from '../../server-api/shared';
import { copyToClipboard, getDate } from '../../utils/UtilFunctions';

const link_prefix = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port  + "/post/view/";
const link_prefix_shared = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port  + "/post/shared/";

export default function SharePost(postData: IPost & { onClose: () => void }) {
  const userData = store.getState().auth.userData;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [link, setLink] = useState<IShareLink>({uuid: "null", expires_at: 0});
  
  useEffect(() => {
    if ((postData.author_id === userData.uid) && !postData.public){
      (async () => {
        await getSharedLink(postData.id || -1)
        .then((resp) => {
          setLink(resp as IShareLink);
        })
        .catch((error) => console.log("link doesnt exist"));

        setIsLoading(false);
      }) ();
    } else { 
      setLink({uuid: String(postData.id), expires_at: -1});
      setIsLoading(false);
    }
  }, []);

  const handleCreateLink = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formElements = e.currentTarget.elements as typeof e.currentTarget.elements & {
      data: HTMLInputElement
    };

    (async () => {
      await postShareLink({post_id: postData.id || -1, expires_at: ((new Date(formElements.data.value)).getTime()) / 1000 })
        .then((resp) => {
          setLink(resp as IShareLink);
        })
        .catch((error) => console.log("cannot create shared link"));
    }) ();
  }

  const handleDeleteLink = () => {
    (async () => {
      await deleteSharedLink(link.uuid)
        .then((resp) => setLink({ uuid: "null", expires_at: -1 }))
        .catch((error) => console.log("cannot delete link"));
    }) ();
  }
  
  return (
    <div className={styles.container}>
      {
        isLoading ? <Loader />
          :
            <>
              {
                link.uuid == "null" ? 
                  <>
                    <p>Выберите срок действия ссылки</p>

                    <form onSubmit={handleCreateLink}>
                      <input 
                        name='data' 
                        type='datetime-local'
                        placeholder='now' 
                        required
                      />
                      <button 
                        type='submit' 
                        className={styles.button_dark} 
                      >
                        Сгенерировать общую ссылку
                      </button>
                    </form>
                  </>
                :
                  (postData.author_id === userData.uid) && !postData.public ?
                    <>
                      <input 
                        name="link" 
                        type='url' 
                        placeholder='link' 
                        disabled
                        defaultValue={link_prefix_shared + link.uuid}
                      />

                      <p>Действительна до: { getDate(link.expires_at) }</p>
                      
                      <form>
                        <button type='button' onClick={ () => {
                          copyToClipboard(link_prefix_shared + link.uuid);
                          postData.onClose();
                        }}>Скопировать в буфер обмена</button>
                        <button type='button' className={styles.button_dark} onClick={ () => handleDeleteLink() }>Удалить общую ссылку</button>
                      </form>
                    </>
                  :
                    <>
                      <input 
                        name="link" 
                        type='url' 
                        placeholder='link' 
                        disabled
                        defaultValue={link_prefix + link.uuid}
                      />

                      <form>
                        <button type='button' onClick={ () => {
                          copyToClipboard(link_prefix + link.uuid);
                          postData.onClose();
                        }}>Скопировать в буфер обмена</button>
                      </form>
                    </>
              }
            </>
      }
    </div>
  )
}