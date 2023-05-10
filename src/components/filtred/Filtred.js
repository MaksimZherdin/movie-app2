import { Radio } from 'antd';
import React from 'react';

export default function Filtred({ getRatedMovies, updateList, setFilterRated, setIsSearchPage }) {
  const changeList = (value) => {
    if (value) {
      updateList();
      setFilterRated(true);
      setIsSearchPage(true);
    } else {
      getRatedMovies();
      setFilterRated(false);
      setIsSearchPage(false);
    }
  };

  return (
    <Radio.Group defaultValue="a">
      <Radio.Button onChange={() => changeList(true)} className="input-item" value="a">
        Search
      </Radio.Button>
      <Radio.Button onChange={() => changeList(false)} className="input-item" value="b">
        Rated
      </Radio.Button>
    </Radio.Group>
  );
}
