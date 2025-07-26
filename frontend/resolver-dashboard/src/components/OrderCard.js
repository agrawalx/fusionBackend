import React from 'react';

const OrderCard = ({ order, onFulfill, onReveal }) => {
  return (
    <div className="order-card">
      <p><strong>Maker:</strong> {order.maker}</p>
      <p><strong>Src Token:</strong> {order.srcToken}</p>
      <p><strong>Dst Token:</strong> {order.dstToken}</p>
      <p><strong>Src Amount:</strong> {order.srcAmount}</p>
      <p><strong>Dst Amount:</strong> {order.dstAmount}</p>
      <button onClick={() => onFulfill(order)}>Fulfill Order</button>
      {order.status === 'FILLED' && (
        <button onClick={() => onReveal(order)}>View Secret</button>
      )}
    </div>
  );
};

export default OrderCard;