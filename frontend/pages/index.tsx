import { ethers } from 'ethers';
import HungryPug from '../components/pets/HungryPug';
import { PET_ADDRESS } from '../utils/constants';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';
import React from 'react';
import { useWalletContext } from '../contexts/Wallet.context';

export default function Home() {
  const [totalEthFed, setTotalEthFed] = React.useState<number>(0);
  const { getProvider } = useWalletContext();

  const provider = getProvider();

  const getEthFed = async () => {
    const contract = new ethers.Contract(
      PET_ADDRESS,
      petContract.abi,
      provider
    );
    const totalEthResponse = await contract.getTotalGlobalPurchased();
    return ethers.utils.formatEther(totalEthResponse);
  };

  React.useEffect(() => {
    (async () => {
      const ethFedBigNumber = await getEthFed();
      setTotalEthFed(parseFloat(ethFedBigNumber));
    })();
  }, []);

  return (
    <div
      className="pb-20"
      style={{
        background: 'url(splash.jpg) no-repeat center center fixed',
        backgroundSize: 'cover',
      }}
    >
      <div className="w-screen h-screen">
        <div className="w-screen h-screen flex container mx-auto">
          <div className="mx-auto pt-20 mt-20 px-5 text-gray-900 font-bold text-3xl">
            Metapaws have eaten <b>{totalEthFed.toFixed(2)} ETH</b>,
            contributing to <b>{(totalEthFed * 50).toFixed(2)} kg</b> of food
            for real animals!
          </div>
        </div>
      </div>
      <div className="container mx-auto text-gray-900 bg-white p-5 mt-5 rounded-xl shadow-xl grid sm:grid-cols-3 grid-cols-1 gap-5">
        <div>
          <HungryPug
            baseColor="#EAEAEA"
            secondaryColor="#AEAEAE"
            strokeColor="black"
            tongueColor="#F67171"
          />
        </div>
        <div className="col-span-2 flex">
          <div className="my-auto">
            <div className="font-bold text-3xl">What is a Metapaw?</div>
            <div>
              Metapaws are publicly mintable <b>NFTs</b> that live on the
              blockchain
              <br />
              Metapaws, just like real pet, needs your{' '}
              <b>food 🍚 and love ❤️</b>
              <br />
              However, a Metapaw's diet consists of <b>💵 cryptocurrency 💵 </b>
              <br />
              Everytime you feed your Metapaw, you{' '}
              <b>feed the mouths of real animals! 🐶 🐱 </b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
