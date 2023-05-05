import { Col, Row, Spin, Input, Pagination, Alert } from "antd";
import ItemList from "../item-list/ItemList";
import './app.css'
import { createContext, useContext, useEffect, useState } from "react";
import { Offline, Online } from "react-detect-offline";
import Filtred from "../filtred/Filtred";
import useDebounce from "../../hooks/useDebounce";
import { tr } from "date-fns/locale";
import { GenresContext } from "../../context";

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [itemList, setItemList] = useState([]);
  const [value, setValue] = useState('');
  const [noFound, setNoFound] = useState(false);
  const [current, setCurrent] = useState(1);
  const [isSearchPage, setIsSearchPage] = useState(true);
  const [sessionId, setSessionId] = useState('');
  const [filterRated, setFilterRated] = useState(true);
  const [genres, setGenres] = useState([]);

  const onError = () => {
    setError(false)
  }
  const getGenres = async () => {
    const api = await fetch('https://api.themoviedb.org/3/genre/movie/list?api_key=8eb990e8d45932d2d405a1da0dec19fa')
      .then(res => res.json())
    setGenres(api.genres)
  }
  const updateList = async () => {
    setNoFound(false);
    setIsLoading(false);
    const api = await fetch('https://api.themoviedb.org/3/search/movie?api_key=8eb990e8d45932d2d405a1da0dec19fa&query=return')
      .then(res => res.json())
      .catch(() => onError());
    setIsLoading(true);
    setItemList(api.results);
  }
  const updatePagination = async (e) => {
    setNoFound(false);
    setIsLoading(false);
    let api = [];
    if (filterRated) {
      api = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=8eb990e8d45932d2d405a1da0dec19fa&query=${value ? value : 'return'}&page=${e}`)
        .then(res => res.json())
        .catch(() => onError());
      setCurrent(e)
      console.log('not rated movies')
      if (api.results.length === 0) {
        setNoFound(true);
        setIsLoading(true);
      }
    } else {
      api = await fetch(`https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=8eb990e8d45932d2d405a1da0dec19fa&page=${e}`)
        .then(res => res.json())
        .catch(() => onError())
      setCurrent(e)
      console.log('rated movies')
      if (api.results.length === 0) {
        setNoFound(true);
        setIsLoading(true);
      }
    }
    setIsLoading(true);
    setItemList(api.results)
  }
  const newGuestSession = async () => {
    const api = await fetch('https://api.themoviedb.org/3/authentication/guest_session/new?api_key=8eb990e8d45932d2d405a1da0dec19fa')
      .then(res => res.json())
      .then(res => setSessionId(res.guest_session_id));
  }
  const getRatedMovies = async () => {
    setIsLoading(false);
    const api = await fetch(`https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=8eb990e8d45932d2d405a1da0dec19fa`)
      .then(res => res.json())
    setItemList(api.results)
    setIsLoading(true);
    setCurrent(1);
  }
  const onChange = async (e) => {
    const api = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=8eb990e8d45932d2d405a1da0dec19fa&query=${e.target.value ? e.target.value : 'return'}`)
      .then(res => res.json())
      .catch(() => onError());
    if (api.results.length === 0) {
      setNoFound(true)
      setIsLoading(true)
      setItemList(api.results)
    }
    setCurrent(1);
    setIsLoading(true);
    setItemList(api.results)
  }
  const handleChange = (e) => {
    setValue(e.target.value)
    setIsLoading(false)
    debounceFunc(e);
  }
  const debounceFunc = useDebounce(onChange, 1000);
  useEffect(() => {
    updateList();
    getGenres();
    newGuestSession();
  }, []);

  return (
    <>
      {/* <Online> */}
      <div className="App">
        <GenresContext.Provider value={genres}>
          {error ? <Alert type="error" message="Something gone wrong..." /> : <>
            <Row className="header" justify={"center"}>
              <Filtred setIsSearchPage={setIsSearchPage} setFilterRated={setFilterRated} updateList={updateList} getRatedMovies={getRatedMovies} />
              {isSearchPage && <Input value={value} onChange={(e) => handleChange(e)} className="input" placeholder="Type to search..." />}
            </Row>
            <Row className="main" justify={"center"}>
              {noFound ? <Alert type="error" message="We didn't found any films..." /> : null}
              <Col className="item" span={8}>
                {isLoading ? <ItemList itemList={itemList} sessionId={sessionId} /> : <Spin size="large" />}
              </Col>
            </Row>
            <Pagination current={current} onChange={(e) => updatePagination(e)} className="pagination" defaultCurrent={1} total={50} />
          </>
          }
        </GenresContext.Provider>
      </div>
      {/* </Online>
      <Offline>
        <Alert type="error" message="Your internet connection is lost..." />
      </Offline> */}
    </>
  );
}

export default App;