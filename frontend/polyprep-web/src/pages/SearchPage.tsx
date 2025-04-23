import styles from "./SearchPage.module.scss"
import IconSearch from "../icons/search.svg"
import Card from "../components/Card";

const SearchPage = () => {
  const test = true;

  return (
    <div className={styles.container}>
      <form>
        <input 
          name='comment' 
          type='text' 
          placeholder='Вышмат 5 сем Пупкин' 
          maxLength={350}
          required>
        </input>

        <button type='submit'>
          <img src={IconSearch} alt='send'/>
        </button>
      </form>

      <div className={styles.cards_container}>
        {
          test ? 
            <>
              <Card 
                id={1}
                created_at={1745160699283}
                updated_at={1745160699283}
                scheduled_at={1745160699283}
                author_id="1"
                title='Конспекты по кмзи от Пупки Лупкиной' 
                text='Представляю вам свои гадкие конспекты по вышматы или не вышмату не знаб но не по кмзи точно<br></br>Да, именно так'
                public={true}
                hashtages={["#hype", "#math", "#hochy5"]}
              />
            </>
          : 
            <h2 className={styles.not_found}>Ничего не найдено :(</h2>
        }
        
      </div>
    </div>
  )
}

export default SearchPage;