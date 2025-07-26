import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import OrderList from './components/OrderList';
import { waitForEvent } from './utils/eventListener';
import EscrowFactorySrc from './contracts/EscrowFactorySrc.json';
import EscrowFactoryDest from './contracts/EscrowFactoryDest.json';

const SRC_CHAIN_ID = '0x13881'; 
const DST_CHAIN_ID = '0x2328'; 

const SRC_FACTORY_ADDRESS = '0xSrcFactoryAddress';
const DST_FACTORY_ADDRESS = '0xDstFactoryAddress';

const App = () => {
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethProvider);
    } else {
      alert('Please install MetaMask');
    }
  }, []);

  const switchToChain = async (chainIdHex) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (err) {
      console.error('Network switch failed:', err);
    }
  };

  const fulfillOrder = async (order) => {
    if (!provider) return;

    // 1. Switch to Source Chain
    await switchToChain(SRC_CHAIN_ID);
    const srcSigner = await provider.getSigner();
    const srcFactory = new ethers.Contract(SRC_FACTORY_ADDRESS, EscrowFactorySrc.abi, srcSigner);

    const srcEscrowAddr = await srcFactory.createEscrow(
      order.maker,
      order.resolver,
      order.amount,
      order.hashlock,
      order.timelock
    );
    console.log("Escrow deployed at:", escrowAddress);

    // 2. Switch to Destination Chain
    await switchToChain(DST_CHAIN_ID);
    const dstSigner = await provider.getSigner();
    const dstFactory = new ethers.Contract(DST_FACTORY_ADDRESS, EscrowFactoryDest.abi, dstSigner);

    const dstEscrowAddr = await dstFactory.createEscrow(
      order.maker,
      order.resolver,
      order.amount,
      order.hashlock,
      order.timelock
    );
    console.log("Escrow deployed at:", escrowAddress);


    // 3. Update backend order status
    await fetch(`/api/updateOrder/${order.orderHash}`, {
      method: 'POST',
      body: JSON.stringify({ status: 'FILLED', srcEscrowAddr, dstEscrowAddr }),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const revealSecret = async (order) => {
    if (!provider) return;

    // Get secret from backend or localStorage (assume you store it off-chain)
    const res = await fetch(`/api/getSecret/${order.orderHash}`);
    const { secret } = await res.json();

    // Claim on Src Escrow
    await switchToChain(SRC_CHAIN_ID);
    const srcSigner = await provider.getSigner();
    const srcEscrow = new ethers.Contract(order.srcEscrowAddr, EscrowFactorySrc.abi, srcSigner);
    await srcEscrow.claim(secret);

    // Claim on Dst Escrow
    await switchToChain(DST_CHAIN_ID);
    const dstSigner = await provider.getSigner();
    const dstEscrow = new ethers.Contract(order.dstEscrowAddr, EscrowFactoryDest.abi, dstSigner);
    await dstEscrow.claim(secret);
  };

  return (
    <div>
      <h1>Resolver Dashboard</h1>
      <OrderList onFulfill={fulfillOrder} onReveal={revealSecret} />
    </div>
  );
};

export default App;
