import { BigNumber, ethers, Signer } from 'ethers';
import { PET_ADDRESS } from '../utils/constants';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';

export async function adoptAbandonedPet(
  address: string,
  petId: number,
  signer: Signer
): Promise<number | null> {
  const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);
  const adoptionFee = await contract.adoptionFee();
  const result = await contract.adoptDeadPet(address, BigNumber.from(petId), {
    value: adoptionFee,
  });
  const receipt = await result.wait();
  return receipt;
}
