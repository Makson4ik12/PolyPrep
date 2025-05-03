import styles from "./SearchPage.module.scss"
import IconSearch from "../icons/search.svg"
import Card from "../components/Card";
import { useQuery } from "@tanstack/react-query";
import { ISearchPostsResponse, searchPosts } from "../server-api/posts";
import Loader from "../components/Loader";
import Masonry from "react-layout-masonry";
import cardStyles from '../components/Card.module.scss'
import { useLocation, useSearchParams } from "react-router-dom";

const fetchSearchPosts = async (text: string) => {
  const resp = await searchPosts({ from: "0", to: "20", text: text});
  return resp as ISearchPostsResponse;
};

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get("q");

  const { data, isLoading, error } = useQuery({
    queryKey: ['searchpage-' + querySearch],
    queryFn: () => fetchSearchPosts(querySearch || ""),
    staleTime: 5 * 60 * 1000, // 5 минут
    enabled: !!querySearch
  });

  return (
    <div className={styles.container}>
      <form>
        <input 
          name='q' 
          type='text' 
          placeholder='Вышмат 5 сем Пупкин' 
          maxLength={350}
          defaultValue={querySearch || ""}
          required>
        </input>

        <button type='submit'>
          <img src={IconSearch} alt='send'/>
        </button>
      </form>

      {
        isLoading ?
          <Loader />
        :
          data && (data.result.length) > 0 ?
            <Masonry
              columns={{640:1, 1200: 2}}
              gap={20}
              className={styles.cards_container}
              columnProps={{
                className: cardStyles.card_wrapper
              }}
            >
              {
                data?.result.map((item) => 
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
            <p>Ничего не найдено :(</p>
        }
    </div>
  )
}

export default SearchPage;