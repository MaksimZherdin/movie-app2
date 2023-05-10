import { Col, Row, Spin, Input, Pagination, Alert } from 'antd';
import './app.css';
import { useEffect, useMemo, useState } from 'react';
import { Detector } from 'react-detect-offline';

import ItemList from '../item-list/ItemList';
import Filtred from '../filtred/Filtred';
import useDebounce from '../../hooks/useDebounce';
import GenresContext from '../../context/index';

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
  const [loadingGenres, setLoadingGenres] = useState(false);
  const onError = () => {
    setError(false);
  };
  const getGenres = async () => {
    const api = await fetch(
      'https://api.themoviedb.org/3/genre/movie/list?api_key=8eb990e8d45932d2d405a1da0dec19fa'
    ).then((res) => res.json());
    setGenres(api.genres);
    setLoadingGenres(true);
  };
  const updateList = async () => {
    setNoFound(false);
    setIsLoading(false);
    const api = await fetch(
      'https://api.themoviedb.org/3/search/movie?api_key=8eb990e8d45932d2d405a1da0dec19fa&query=return'
    )
      .then((res) => res.json())
      .catch(() => onError());
    setIsLoading(true);
    setItemList(api.results);
  };
  const updatePagination = async (e) => {
    setNoFound(false);
    setIsLoading(false);
    let api = [];
    if (filterRated) {
      api = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=8eb990e8d45932d2d405a1da0dec19fa&query=${
          value || 'return'
        }&page=${e}`
      )
        .then((res) => res.json())
        .catch(() => onError());
      setCurrent(e);
      if (api.results.length === 0) {
        setNoFound(true);
        setIsLoading(true);
      }
    } else {
      api = await fetch(
        `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=8eb990e8d45932d2d405a1da0dec19fa&page=${e}`
      )
        .then((res) => res.json())
        .catch(() => onError());
      setCurrent(e);
      if (api.results.length === 0) {
        setNoFound(true);
        setIsLoading(true);
      }
    }
    setIsLoading(true);
    setItemList(api.results);
  };
  const newGuestSession = async () => {
    await fetch(
      'https://api.themoviedb.org/3/authentication/guest_session/new?api_key=8eb990e8d45932d2d405a1da0dec19fa'
    )
      .then((res) => res.json())
      .then((res) => setSessionId(res.guest_session_id));
  };
  const getRatedMovies = async () => {
    setIsLoading(false);
    const api = await fetch(
      `https://api.themoviedb.org/3/guest_session/${sessionId}/rated/movies?api_key=8eb990e8d45932d2d405a1da0dec19fa`
    ).then((res) => res.json());
    setItemList(api.results);
    setIsLoading(true);
    setCurrent(1);
  };
  const onChange = async (e) => {
    const api = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=8eb990e8d45932d2d405a1da0dec19fa&query=${
        e.target.value ? e.target.value : 'return'
      }`
    )
      .then((res) => res.json())
      .catch(() => onError());
    if (api.results.length === 0) {
      setNoFound(true);
      setIsLoading(true);
      setItemList(api.results);
    }
    setCurrent(1);
    setIsLoading(true);
    setItemList(api.results);
  };
  const debounceFunc = useDebounce(onChange, 1000);
  useEffect(() => {
    updateList();
    getGenres();
    newGuestSession();
  }, []);
  const handleChange = (e) => {
    setValue(e.target.value);
    setIsLoading(false);
    debounceFunc(e);
  };
  const providerData = useMemo(
    () => ({
      genres,
      loadingGenres,
    }),
    [genres]
  );

  return (
    <Detector
      render={({ online }) => (
        <div className="App">
          {online ? (
            <GenresContext.Provider value={providerData}>
              {error ? (
                <Alert type="error" message="Something gone wrong..." />
              ) : (
                <>
                  <Row className="header" justify="center">
                    <Filtred
                      setIsSearchPage={setIsSearchPage}
                      setFilterRated={setFilterRated}
                      updateList={updateList}
                      getRatedMovies={getRatedMovies}
                    />
                    {isSearchPage && (
                      <Input
                        value={value}
                        onChange={(e) => handleChange(e)}
                        className="input"
                        placeholder="Type to search..."
                      />
                    )}
                  </Row>
                  <Row className="main" justify="center">
                    {noFound ? <Alert type="error" message="We didn't found any films..." /> : null}
                    <Col className="item" span={8}>
                      {isLoading ? <ItemList itemList={itemList} sessionId={sessionId} /> : <Spin size="large" />}
                    </Col>
                  </Row>
                  <Pagination
                    current={current}
                    onChange={(e) => updatePagination(e)}
                    className="pagination"
                    defaultCurrent={1}
                    total={50}
                  />
                </>
              )}
            </GenresContext.Provider>
          ) : (
            <Alert type="error" message="Your internet connection is lost..." />
          )}
        </div>
      )}
    />
  );
}

export default App;
