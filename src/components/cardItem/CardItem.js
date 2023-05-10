import React, { useContext, useEffect, useState } from 'react';
import format from 'date-fns/format';
import Card from 'antd/es/card/Card';
import './cardItem.css';
import { Rate } from 'antd';

import GenresContext from '../../context';

export default function CardItem({ item, sessionId }) {
  let date = '';
  const [listGenres, setListGenres] = useState([]);
  const { genres, loadingGenres } = useContext(GenresContext);
  /* eslint-disable no-unused-vars */
  const [rating, setRating] = useState(0);
  const colors = (number) => {
    if (number >= 0 && number <= 3) {
      return '#E90000';
    }
    if (number >= 3 && number <= 5) {
      return '#E97E00';
    }
    if (number >= 5 && number <= 7) {
      return '#E9D100';
    }
    return '#66E900';
  };
  if (item.release_date.length === 0) {
    date = 'Unknown';
  } else {
    date = format(new Date(item.release_date), 'MMMM dd, yyyy');
  }
  const number = item.vote_average.toFixed(1);

  const ratingFn = async (e) => {
    const data = { value: e };
    setRating(e);
    await fetch(
      `https://api.themoviedb.org/3/movie/${item.id}/rating?api_key=8eb990e8d45932d2d405a1da0dec19fa&guest_session_id=${sessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify(data),
      }
    );
  };
  const takeGenres = () => {
    const arr = [];
    genres.forEach((genre) => {
      item.genre_ids.forEach((itemGenre) => (genre.id === itemGenre ? arr.push(genre.name) : null));
    });
    setListGenres(arr);
  };
  useEffect(() => {
    takeGenres();
  }, [loadingGenres]);
  const overviewCut = (text) => {
    const arr = text.split(' ');
    if (arr.length >= 15) {
      return `${arr.slice(0, 15).join(' ')}...`;
    }
    return text;
  };
  return (
    <li className="card">
      <div className="card-item">
        <img
          alt="example"
          src={
            item.poster_path
              ? `https://image.tmdb.org/t/p/w500/${item.poster_path}`
              : 'https://via.placeholder.com/500x500'
          }
        />
        <Card className="mt" title={item.original_title} hoverable style={{ width: 240 }}>
          <div className="date">{date}</div>
          <ul className="genres">
            {listGenres.map((item, id = 0) => (
              <li key={id + 1} className="genres-item">
                {item}
              </li>
            ))}
          </ul>
          {window.innerWidth > 480 && <p className="overview">{overviewCut(item.overview)}</p>}
          <span style={{ border: `2px solid ${colors(number)}` }} className="rating">
            {number}
          </span>
          {window.innerWidth > 480 && <Rate onChange={(e) => ratingFn(e)} allowHalf defaultValue={item.rating} />}
        </Card>
      </div>
      {window.innerWidth <= 480 && <p className="overview">{overviewCut(item.overview)}</p>}
      {window.innerWidth <= 480 && (
        <Rate className="d-flex" onChange={(e) => ratingFn(e)} allowHalf defaultValue={item.rating} />
      )}
    </li>
  );
}
