import styles from '../modals/ChangeUserImage.module.scss'
import { IPost } from '../../server-api/posts'
import { useEffect, useState } from 'react';
import { getUser, IUser, postUserImage, putUserPhoto } from '../../server-api/user';
import { useAppSelector } from '../../redux-store/hooks';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import IconUser from '../../icons/user.svg'
import Loader from '../Loader';

const fetchUserData = async (uid: string) => {
	const resp = await getUser(uid);
	return resp as IUser;
};

export default function ChangeUserImage({ onClose }: { onClose: () => void }) {
	const uid = useAppSelector((state) => state.auth.userData.uid);
	const queryClient = useQueryClient();

	const [isError, setIsError] = useState({ind: false, error: ""});
	const [isLoading, setIsLoading] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	
	const { data: userData, isLoading: loadingData, error } = useQuery({
    queryKey: ['user-' + uid + '-image'],
    queryFn: () => fetchUserData(uid || "-1"),
    staleTime: 5 * 60 * 1000,
  });
	
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
    formData.append('image', selectedFile);

		if (userData?.img_link != "") {
			await putUserPhoto(formData)
				.then((resp) => {
					onClose();
				})
				.catch((error) => {
					setIsError({ind: true, error: "Ошибка - фото не загружено("});
				});
		} else {
			await postUserImage(formData)
				.then((resp) => {
					onClose();
				})
				.catch((error) => {
					setIsError({ind: true, error: "Ошибка - фото не обновлено("});
				});
		}

		setPreviewUrl(null);
		setSelectedFile(null);
		await queryClient.invalidateQueries({ queryKey: ['user-' + uid + '-image'] });

		setIsLoading(false);
  }
  
  return (
    <div className={styles.container}>
			{
				(loadingData || isLoading) ? <Loader /> 
				:
					<>
						<img
							src={previewUrl || ((userData?.img_link != "") ? userData?.img_link : IconUser)}  
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