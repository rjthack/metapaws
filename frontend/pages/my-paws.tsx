import { BigNumber, ethers } from 'ethers';
import { useEffect, useState } from 'react';
import PetList from '../components/pet-list/PetList';
import { useWalletContext } from '../contexts/Wallet.context';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';
import { Pet } from '../types/Pet';
import Spinner from '../components/general/Spinner';
import { PET_ADDRESS } from '../utils/constants';
import { getPetFromId } from '../utils/pet';
import { useRouter } from 'next/router';

export default function MyPaws() {
  const router = useRouter();
  const { address, getProvider } = useWalletContext();
  const [pets, setPets] = useState<Pet[] | undefined>(undefined);

  const getPetData = async () => {
    const signer = getProvider().getSigner();
    const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);
    // const result: BigNumber = await contract.balanceOf(address);
    // const numberOfTokens = result.toNumber();
    // console.log(numberOfTokens);
    // if(numberOfTokens <= 0) return [];
    // const promises = [];
    // for(let i = 0; i < numberOfTokens; i++){
    //     promises.push(contract.tokenOfOwnerByIndex(address, i));
    // }
    // const petDatas = await Promise.all(promises)
    const result = await contract.getOwnerPets(address);
    return result;
  };

  useEffect(() => {
    getPetData()
      .then((tokenIds: BigNumber[]) => {
        setPets(
          tokenIds.map(getPetFromId).map((pet) => ({
            ...pet,
            owner: address!,
          }))
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  function onClickPet(pet: Pet) {
    router.push(`/paw/${pet.series}/${pet.id}`);
  }

  return (
    <div className="pt-20 container mx-auto text-gray-800">
      <div className="mx-5 font-bold text-2xl mb-4">🐾 My Paws</div>
      {!pets ? <Spinner /> : <PetList items={pets} onClick={onClickPet} />}
    </div>
  );
}
