import { BigNumber, ethers, Signer } from 'ethers';
import { PET_ADDRESS } from '../utils/constants';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';

export async function mintPet(
  address: string,
  signer: Signer
): Promise<number | null> {
  const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);
  const result = await contract.mintPet(address, 100, {
    value: await contract.mintingFee(),
  });
  const receipt = await result.wait();

  if (receipt.events !== undefined) {
    const event = receipt.events!.find(
      (event: any) => event.event === 'Transfer'
    )!;
    const tokenId = event.args!['tokenId'];
    return BigNumber.from(tokenId._hex).toNumber();
  }
  return null;
}

export async function getMintingFee(
  signerOrProvider: Signer | ethers.providers.Provider
): Promise<number> {
  const contract = new ethers.Contract(
    PET_ADDRESS,
    petContract.abi,
    signerOrProvider
  );

  const mintingFeeBigNumber = await contract.mintingFee();
  return parseFloat(ethers.utils.formatEther(mintingFeeBigNumber));
}
