import { ethers } from 'ethers';
import { useWalletContext } from '../contexts/Wallet.context';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';
import { useEffect, useState } from 'react';
import HungryPug from '../components/pets/HungryPug';
import Spinner from '../components/general/Spinner';
import { PET_ADDRESS } from '../utils/constants';
import { getPetFromId } from '../utils/pet';
import { Card } from 'flowbite-react';
import { getMintingFee, mintPet } from '../contract-calls/mint';
import { useRouter } from 'next/router';

export default function Mint() {
  const router = useRouter();
  const { address, getProvider } = useWalletContext();
  const [isMinting, setIsMinting] = useState(false);
  const [mintingFee, setMintingFee] = useState(0);
  const [mintedId, setMintedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMintingFee(getProvider()).then(setMintingFee);
  });

  const tryMintPet = async () => {
    if (!address) {
      setError('Connect your wallet first!');
      return null;
    }

    const signer = getProvider().getSigner();

    return await mintPet(address, signer);
  };

  async function handleMint() {
    setIsMinting(true);
    try {
      const tokenId = await tryMintPet();
      if (tokenId !== null) {
        router.push(`/paw/HUNGRY_PUG/${tokenId}`);
      }
      setIsMinting(false);
    } catch (err: any) {
      console.log(err);
      setError(err.toString());
      setIsMinting(false);
    }
  }

  return (
    <div className="pt-20 w-screen h-screen text-gray-800 flex">
      <div className="m-auto flex flex-col gap-2">
        {isMinting && (
          <>
            <Spinner />
            <p>Minting your pet...</p>
          </>
        )}
        {!isMinting && (
          <div>
            <div className="text-center bg-white p-5 rounded-xl shadow-xl">
              <div className="text-lg font-bold mb-3">Adopt a Metapaw!</div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className="p-3 bg-indigo-100 text-indigo-400 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition"
                  onClick={handleMint}
                >
                  <div className="relative">
                    <div
                      className="absolute text-gray-300"
                      style={{
                        top: '40%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: 50,
                      }}
                    >
                      ?
                    </div>
                    <div>
                      <HungryPug
                        baseColor="#303030"
                        secondaryColor="#303030"
                        tongueColor="#303030"
                        strokeColor="#202020"
                      />
                    </div>
                  </div>
                  <h6 className="text-2xl mt-2">HungryPugs</h6>
                  <p className="text-sm">{mintingFee} ETH</p>
                </button>
                <button className="p-3 bg-pink-100 text-pink-400 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition">
                  <h6 className="text-2xl mt-2">Coming Soon</h6>
                  <p className="text-sm">0.05 ETH</p>
                </button>
                <button className="p-3 bg-violet-100 text-violet-400 rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-1 transition">
                  <h6 className="text-2xl mt-2">Coming Soon</h6>
                  <p className="text-sm">0.05 ETH</p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
