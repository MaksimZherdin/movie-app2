import React from 'react';

import './item-list.css';
import CardItem from '../cardItem/CardItem';

export default function ItemList({ itemList, sessionId }) {
  return (
    <ul className="grid">
      {itemList.map((item) => (
        <CardItem sessionId={sessionId} item={item} key={item.id} />
      ))}
    </ul>
  );
}
