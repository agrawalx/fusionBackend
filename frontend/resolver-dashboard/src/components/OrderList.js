import React, { useEffect, useState } from 'react';
import { fetchOpenOrders } from '../api/orders';
import OrderCard from './OrderCard';

const OrderList = ({ onFulfill, onReveal }) => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      const openOrders = await fetchOpenOrders();
      setOrders(openOrders);
    };
    loadOrders();
  }, []);

  return (
    <div>
      <h2>Active Orders</h2>
      {orders.map((order) => (
        <OrderCard key={order.orderHash} order={order} onFulfill={onFulfill} onReveal={onReveal} />
      ))}
    </div>
  );
};

export default OrderList;