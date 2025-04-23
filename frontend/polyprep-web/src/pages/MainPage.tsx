import { useEffect, useState } from 'react';
import Card from '../components/Card';
import styles from './MainPage.module.scss'
import { getRandomPosts, IPost } from '../server-api/posts';
import Loader from '../components/Loader';

const MainPage = () => {
  const [randomPosts, setRandomPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      (async () => {
        setIsLoading(true);
  
        await getRandomPosts(10)
        .then((resp) => {
          setRandomPosts(resp as IPost[]);
        })
        .catch((error) => console.log("cannot load user posts"));
  
        setIsLoading(false);
      }) ()
    }, []);
    
  return (
    <div className={styles.container}>
      <div className={styles.cards_container}>
        {
            isLoading ?
              <Loader />
            :
              randomPosts?.length === 0 ? <p>Постов пока нет :(</p>
                :
              <>
                {
                  randomPosts?.map((item) => 
                    <Card 
                      id={item.id}
                      created_at={item.created_at}
                      updated_at={item.updated_at}
                      scheduled_at={item.scheduled_at}
                      author_id={item.author_id}
                      title={item.title} 
                      text={item.text}
                      public={item.public}
                      hashtages={item.hashtages}
                    />
                  )
                }
              </>
          }
      </div>
    </div>
  )
}

export default MainPage;