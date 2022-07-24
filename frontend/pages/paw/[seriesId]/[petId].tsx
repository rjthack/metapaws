import { BigNumber, ethers } from 'ethers';
import { useRouter } from 'next/router';
import { useWalletContext } from '../../../contexts/Wallet.context';
import petContract from '../../../../backend/artifacts/contracts/Pet.sol/Pet.json';
import { PET_ADDRESS } from '../../../utils/constants';
import { PetGraphic } from '../../../components/pets/PetGraphic';
import { getPetFromId } from '../../../utils/pet';
import { useEffect, useState } from 'react';
import Spinner from '../../../components/general/Spinner';
import { Card, Progress } from 'flowbite-react';
import { adoptAbandonedPet } from '../../../contract-calls/adopt-abandoned';
import { getTokenOwner } from '../../../contract-calls/pet-list';
import { truncate } from '../../../utils/stringTruncate';

type PetStats = {
  ownerAddr: string;
  intervalsSinceLastUpdate: number;
  intervalsWithFoodSinceLastUpdate: number;
  amountEatenSinceLastUpdate: number;
  fullnessLevel: number;
  lastFedTimestamp: number;
  feedingInterval: number;
  maxFullnessLevel: number;
  adoptionCount: number;
  feedingAmount: number;
  hasStarvedToDeath: boolean;
};

export default function PetView() {
  const router = useRouter();
  const { seriedId, petId } = router.query;

  const { address, getProvider } = useWalletContext();

  const petIdInt = parseInt(petId as string);

  const petNoOwner = getPetFromId(parseInt(petId as string));
  const pet = {
    ...petNoOwner,
    owner: address as string,
  };

  const [petStats, setPetStats] = useState<PetStats | null>(null);

  const [isPlay, setIsPlay] = useState<boolean>(false);

  const adoptAbandoned = async (petId: number) => {
    const signer = getProvider().getSigner();
    const res = await adoptAbandonedPet(address!, petId, signer);
    router.push(`/paw/HUNGRY_PUGS/${petId}`);
  };

  const getPetData = async (petId: number) => {
    const id = BigNumber.from(petId);
    const provider = getProvider();
    const contract = new ethers.Contract(
      PET_ADDRESS,
      petContract.abi,
      provider
    );

    console.log('id:', petId);

    // getIntervalsSinceLastUpdate(tokenId), works
    // getFullnessLevel(tokenId),
    // getLastFedTimestamp(tokenId),
    // getMaxFullnessLevel(tokenId),
    // hasStarvedToDeath(tokenId)

    console.log(await contract.getFullnessLevel(id));

    const ownerAddress = await getTokenOwner(provider, petId);

    const feedingAmount = await contract.feedingAmount();
    const feedingInterval = await contract.feedingInterval();
    const intervalsWithFood = await contract.getIntervalsWithFood(id);

    const resultRaw = await contract.getPetData(id);
    const intervalsSinceLastUpdate = resultRaw[0].toNumber();

    const intervalsOfFoodEaten = Math.min(
      intervalsWithFood,
      intervalsSinceLastUpdate
    );

    const result: PetStats = {
      ownerAddr: ownerAddress,
      intervalsSinceLastUpdate: intervalsSinceLastUpdate,
      fullnessLevel: resultRaw[1].toNumber(),
      lastFedTimestamp: resultRaw[2].toNumber(),
      maxFullnessLevel: resultRaw[3].toNumber(),
      adoptionCount: resultRaw[4].toNumber(),
      hasStarvedToDeath: resultRaw[5],
      feedingInterval: feedingInterval.toNumber(),
      feedingAmount: feedingAmount.toNumber(),
      amountEatenSinceLastUpdate:
        intervalsOfFoodEaten * feedingAmount.toNumber(),
      intervalsWithFoodSinceLastUpdate: intervalsOfFoodEaten,
    };
    return result;
  };

  function updatePetData() {
    setPetStats(null);
    getPetData(petIdInt)
      .then((res: PetStats) => setPetStats(res))
      .catch((err) => console.log(err));
  }

  function onClickPlay() {
    setIsPlay(true);
    setTimeout(() => setIsPlay(false), 3600);
  }

  useEffect(() => {
    if (!petId || petId === undefined) return;
    updatePetData();
  }, [petId]);

  return (
    <div className="pt-20 container mx-auto text-gray-800 text-center">
      <div className="font-bold text-3xl ">HungryPug #{pet.id}</div>

      {petStats !== null ? (
        <>
          <div className="font-bold text-md mb-5">
            adopted by: {truncate(petStats.ownerAddr, 15)}{' '}
            {petStats.ownerAddr === address && '(me)'}
          </div>
          <div
            className="mx-auto cursor-pointer"
            style={{ maxWidth: 300 }}
            onClick={onClickPlay}
          >
            <PetGraphic pet={pet} isPlay={isPlay} />
          </div>
          <div className="max-w-sm mx-auto -mt-6 relative z-30">
            <div className="bg-white p-5 rounded-2xl shadow-xl">
              <div className="relative">
                <button
                  onClick={updatePetData}
                  className="absolute right-0 top-0"
                >
                  🔄
                </button>
              </div>
              {petStats.hasStarvedToDeath ? (
                <div className="font-bold my-7">
                  This metapaw has been abandoned by its owner :( <br />
                  Last seen:{' '}
                  {(petStats.intervalsSinceLastUpdate -
                    petStats.intervalsWithFoodSinceLastUpdate) *
                    petStats.feedingInterval}
                  s ago
                  <br />
                  <button
                    onClick={async () => adoptAbandoned(pet.id)}
                    className="bg-green-100 p-3 mt-2 rounded-xl shadow-md font-bold over:-translate-y-1 hover:shadow-lg hover:scale-105 transition mx-1"
                  >
                    Adopt me!
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-start text-lg font-bold mt-2">
                    <div className="flex gap-4">
                      <div>❤️</div>
                      <div className="flex-1">
                        <div>
                          {petStats.fullnessLevel}/{petStats.maxFullnessLevel}
                        </div>
                        <Progress
                          progress={Math.round(
                            (100 * petStats.fullnessLevel) /
                              petStats.maxFullnessLevel
                          )}
                        />
                      </div>
                    </div>
                  </p>
                  <p className="text-start text-lg mt-4">
                    <div className="flex gap-4">
                      <div>⏰</div>
                      <div>
                        <div className="font-bold">
                          {ethers.utils.formatEther(
                            (petStats.feedingAmount * 24 * 60 * 60) /
                              petStats.feedingInterval
                          )}{' '}
                          ETH/day (~$1)
                        </div>
                        <div>
                          <p className="text-start text-sm font-semibold -mt-1">
                            {ethers.utils.formatEther(petStats.feedingAmount)}{' '}
                            ETH per {petStats.feedingInterval}s
                          </p>
                        </div>
                      </div>
                    </div>
                  </p>
                  <p className="mt-2">
                    <div className="flex gap-4">
                      <div>🍖</div>
                      <div className="text-start">
                        <div className="text-lg font-bold">
                          Consumed{' '}
                          {ethers.utils.formatEther(
                            petStats.amountEatenSinceLastUpdate
                          )}{' '}
                          ETH
                        </div>
                        <div className="text-sm font-semibold -mt-1">
                          ~$
                          {(
                            petStats.amountEatenSinceLastUpdate *
                            0.000000000000001613
                          ).toFixed(3)}
                          .../
                          {(
                            petStats.amountEatenSinceLastUpdate *
                            0.00000000000000008
                          ).toFixed(5)}
                          ...kg of real food!
                        </div>
                      </div>
                    </div>
                  </p>
                  <p className="mt-2">
                    <div className="flex gap-4">
                      <div>🏅</div>
                      <div className="text-start">
                        <div className="text-md font-bold">
                          Event Badges{' '}
                          <button className="text-xs font-normal">
                            (redeem)
                          </button>
                        </div>
                        <div className="text-sm font-semibold -mt-1">
                          coming soon
                        </div>
                      </div>
                    </div>
                  </p>

                  {petStats.ownerAddr === address && (
                    <div className="mt-2">
                      <button
                        onClick={() => router.push('/food')}
                        className="bg-green-200 p-3 rounded-xl shadow-md font-bold over:-translate-y-1 hover:shadow-lg hover:scale-105 transition mx-1"
                      >
                        🍖 Feed
                      </button>
                      <button
                        disabled={isPlay}
                        onClick={onClickPlay}
                        className="bg-orange-200 disabled:bg-orange-300 p-3 rounded-xl shadow-md font-bold over:-translate-y-1 hover:shadow-lg hover:scale-105 transition mx-1"
                      >
                        {!isPlay ? '🎾 Play' : '🎾 Playing...'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <Spinner />
      )}
    </div>
  );
}
