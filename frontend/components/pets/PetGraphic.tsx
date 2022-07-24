import { Pet } from '../../types/Pet';
import HungryPug from './HungryPug';

export function PetGraphic(props: { pet: Pet; isPlay?: boolean }): JSX.Element {
  const { pet } = props;
  switch (pet.series) {
    case 'HUNGRY_PUG':
      return <HungryPug {...pet} isPlay={props.isPlay} />;
    default:
      return <></>;
  }
}
