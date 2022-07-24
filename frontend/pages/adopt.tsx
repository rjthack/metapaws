import PetList from '../components/pet-list/PetList';
import { useRouter } from 'next/router';
import { getPetFromId } from '../utils/pet';
import { useEffect, useState } from 'react';
import { getAllTokenIds, getTokenOwner } from '../contract-calls/pet-list';
import { useWalletContext } from '../contexts/Wallet.context';
import Spinner from '../components/general/Spinner';
import { Pet } from '../types/Pet';

export default function Adopt() {
  const router = useRouter();

  const { getProvider } = useWalletContext();

  const [pets, setPets] = useState<Pet[] | null>(null);

  async function getAllPets() {
    const provider = getProvider();
    const tokenIds = await getAllTokenIds(provider);
    const pets: Pet[] = [];

    for (let tokenId of tokenIds) {
      const owner = await getTokenOwner(provider, tokenId);
      pets.push({
        ...getPetFromId(tokenId),
        owner,
      });
    }

    return pets;
  }

  useEffect(() => {
    getAllPets().then((pets) => {
      setPets(pets);
    });
  }, []);

  return (
    <div className="pt-20 container mx-auto text-gray-800">
      <div className="grid sm:grid-cols-2 xs:grid-cols-1 p-5 gap-5">
        <div className="p-5 bg-white border-2 border-gray-200 border-solid rounded-xl">
          <div className="font-bold text-2xl">
            Adopt a virtual pet in the metaverse today!
          </div>
          <div>
            Metapaws, just like real pet, needs your <b>food 🍚 and love ❤️</b>
            <br />
            However, a Metapaw's diet consists of <b>💵 cryptocurrency 💵 </b>
            <br />
            Everytime you feed your Metapaw, you{' '}
            <b>feed the mouths of real animals! 🐶 🐱 </b>
          </div>
        </div>
        <div
          onClick={() => router.push('/mint')}
          className="
        hover:-translate-y-1 hover:shadow-xl hover:scale-105 transition
        p-5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-xl text-white flex cursor-pointer"
        >
          <div className="my-auto">
            <div className="font-bold text-3xl m-auto">Adopt a new Metapaw</div>
            <div>
              Adopt your very own metapaw with randomly generated traits!
            </div>
            <b>Click here to adopt</b>
          </div>
        </div>
      </div>
      {pets === null && <Spinner />}
      {pets !== null && (
        <PetList
          onClick={(pet) => {
            router.push(`/paw/HUNGRY_PUG/${pet.id}`);
          }}
          items={pets}
        />
      )}
    </div>
  );
}
