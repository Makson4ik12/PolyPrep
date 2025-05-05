import styles from './MainPage.module.scss'
import cardStyles from '../components/Card.module.scss'

import Card from '../components/Card';
import Loader from '../components/Loader';
import Masonry from 'react-layout-masonry';
import { getRandomPosts, IRandomPosts } from '../server-api/posts';
import { useQuery } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const fetchRandomPosts = async () => {
  const resp = await getRandomPosts(10);
  return resp as IRandomPosts;
};

const MainPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['mainpage-randomPosts'],
    queryFn: fetchRandomPosts,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  return (
    <div className={styles.container}>      
      {
        isLoading ?
          <Loader />
        :
          !error ?
            <Masonry
              columns={{640:1, 1200: 2}}
              gap={20}
              className={styles.cards_container}
              columnProps={{
                className: cardStyles.card_wrapper
              }}
            >
              {
                data?.posts.map((item) => 
                  <Card 
                    key={item.id}
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
            </Masonry>
          :
            <Navigate  to="/error" />
        }
    </div>
  )
}

export default MainPage;