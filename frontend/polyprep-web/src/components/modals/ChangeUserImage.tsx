import styles from '../modals/ChangeUserImage.module.scss'

import Loader from '../Loader';
import { useState } from 'react';
import { IUser, postUserImage } from '../../server-api/user';
import { useAppSelector } from '../../redux-store/hooks';
import { useQueryClient } from '@tanstack/react-query';

import IconUser from '../../icons/user.svg'

export default function ChangeUserImage({ onClose }: { onClose: () => void }) {
	const uid = useAppSelector((state) => state.auth.userData.uid);
	const queryClient = useQueryClient();

	const [isError, setIsError] = useState({ind: false, error: ""});
	const [isLoading, setIsLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	
	const userData = queryClient.getQueryData(['user-' + uid + '-image']);
	
	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

		if (!selectedFile) return;

    setIsLoading(true);

		const formData = new FormData();
    formData.append('image', selectedFile, "photo.png");

		await postUserImage(formData)
			.then((resp) => {
        queryClient.invalidateQueries({ queryKey: ['user-' + uid + '-image'] }); 
        onClose();
			})
			.catch((error) => {
				setIsError({ind: true, error: "Ошибка - фото не обновлено("});
			});

		setPreviewUrl(null);
		setSelectedFile(null);
		setIsLoading(false);
  }
  
  return (
    <div className={styles.container}>
      {
        isLoading ? <Loader />
        :
          <>
            <img
              src={previewUrl || (((userData as IUser).img_link != "") ? (userData as IUser).img_link : IconUser)}  
              alt='user-icon' 
            />

            <p>Выберите новое фото профиля:</p>

            <form onSubmit={handleUploadPhoto}>
              <input 
                type="file" 
                id="img" 
                name="img" 
                accept="image/*" 
                required 
                placeholder='image'
                onChange={handleFileChange}
              />

              <button 
                type='submit' 
                className={styles.button_dark} 
              >
                Загрузить фото
              </button>

              <p className={ isError.ind ? styles.incorrect_login : styles.incorrect_login_hidden }> {isError.error }</p>
            </form>
          </>
      }
    </div>
  )
}