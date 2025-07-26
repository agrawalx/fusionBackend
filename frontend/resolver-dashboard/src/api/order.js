import axios from 'axios';

export const fetchOpenOrders = async () => {
  const response = await axios.get('/api/orders');
  return response.data;
};