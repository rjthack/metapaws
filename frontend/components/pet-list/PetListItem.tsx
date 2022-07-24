import { useWalletContext } from '../../contexts/Wallet.context';
import { Pet } from '../../types/Pet';
import { truncate } from '../../utils/stringTruncate';
import HungryPug from '../pets/HungryPug';
import { PetGraphic } from '../pets/PetGraphic';

type PetListItemProps = {
  pet: Pet;
  onClick: (pet: Pet) => void;
};

export default function PetListItem(props: PetListItemProps) {
  const { pet, onClick } = props;
  const { address } = useWalletContext();

  function formatOwner(ownerAddress: string) {
    const truncated = truncate(ownerAddress, 5);
    if (ownerAddress === address) {
      return `${truncated} (me)`;
    } else {
      return truncated;
    }
  }

  return (
    <button
      className="bg-white rounded-2xl shadow-md p-5 hover:-translate-y-1 hover:shadow-xl hover:scale-105 transition"
      onClick={() => onClick(pet)}
    >
      <div>
        <PetGraphic pet={pet} />
      </div>
      <div className="font-bold text-lg">HungryPug #{pet.id}</div>
      <div>
        {pet.owner === '' ? 'No Owner!' : `Owned by: ${formatOwner(pet.owner)}`}
      </div>
    </button>
  );
}
