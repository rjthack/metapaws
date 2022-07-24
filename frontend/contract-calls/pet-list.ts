import { BigNumber, ethers, getDefaultProvider, Signer } from 'ethers';
import { PET_ADDRESS } from '../utils/constants';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';

export async function getAllTokenIds(
  signerOrProvider: Signer | ethers.providers.Provider
): Promise<number[]> {
  const contract = new ethers.Contract(
    PET_ADDRESS,
    petContract.abi,
    signerOrProvider
  );

  const tokenCount = await contract.totalSupply();

  const tokenIds: number[] = [];

  for (let tokenIndex = 0; tokenIndex < tokenCount; tokenIndex++) {
    const tokenId = await contract.tokenByIndex(tokenIndex);
    tokenIds.push(tokenId);
  }

  return tokenIds;
}

export async function getTokenOwner(
  signerOrProvider: Signer | ethers.providers.Provider,
  tokenId: number
): Promise<string> {
  const contract = new ethers.Contract(
    PET_ADDRESS,
    petContract.abi,
    signerOrProvider
  );

  const ownerAddress = await contract.ownerOf(tokenId);

  return ownerAddress;
}
