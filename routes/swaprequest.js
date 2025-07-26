import { ethers } from 'ethers';
import Order from '../models/Order.js';

router.post('/createOrder', async (req, res) => {

  const {
    maker, srcToken, dstToken, srcAmount, dstAmount, expiry, signature, salt
  } = req.body;

  const secret = randomBytes(32);
  const secretHex = '0x' + secret.toString('hex'); // 0x-prefixed hex string
  const hashLock = ethers.utils.keccak256(secretHex); // works with hex string

  const orderHash = keccak256(
    ethers.utils.defaultAbiCoder.encode(
      ['address','address','address','uint256','uint256','uint256','uint256'],
      [maker, srcToken, dstToken, srcAmount, dstAmount, salt, expiry]
    )
  );

  const order = new Order({
    orderHash,
    maker,
    srcToken,
    dstToken,
    srcAmount,
    dstAmount,
    expiry,
    signature,
    salt,
    secretHex,
    hashLock
  });

  await order.save();
  res.json({ orderHash, hashLock });
});

router.get('/getAllOrders', async (req, res) => {
  try {
    // Fetch all orders, exclude secretHex field
    
    const orders = await Order.find({}, { status: 'OPEN' },{ secretHex: 0, __v: 0 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;

