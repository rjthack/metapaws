import { Pet } from '../../types/Pet';
import PetListItem from './PetListItem';
import { useRouter } from 'next/router';

type PetListProps = {
  items: Pet[];
  onClick: (pet: Pet) => void;
};

export default function PetList(props: PetListProps) {
  const { items, onClick } = props;
  const router = useRouter();
  return items.length > 0 ? (
    <div className="grid md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 p-5 gap-5">
      {items.map((item) => (
        <PetListItem pet={item} onClick={onClick} />
      ))}
    </div>
  ) : (
    <div
      onClick={() => router.push('/mint')}
      className="
    hover:-translate-y-1 hover:shadow-xl hover:scale-105 transition
    p-5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-xl shadow-xl text-white flex cursor-pointer"
    >
      <div className="my-auto">
        <div className="font-bold text-3xl m-auto">Mint a new Metapaw</div>
        <div>Mint your very own metapaw with randomly generated traits!</div>
        <b>Click here to mint</b>
      </div>
    </div>
  );
}
