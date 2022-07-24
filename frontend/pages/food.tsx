import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { useWalletContext } from '../contexts/Wallet.context';
import { PET_ADDRESS } from '../utils/constants';
import petContract from '../../backend/artifacts/contracts/Pet.sol/Pet.json';
import { Button, Card, Label, TextInput } from 'flowbite-react';

export default function DepositFood() {
  const { address, getProvider } = useWalletContext();
  const [currentFoodBalance, setCurrentFoodBalance] = useState<
    string | undefined
  >(undefined);
  const [totalFoodInContract, setTotalFoodInContract] = useState<
    string | undefined
  >(undefined);
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0.05);
  const [withdrawAmount, setWithdrawAmount] = useState(0);

  const getCurrentFood = async () => {
    const signer = getProvider().getSigner();
    const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);

    const amtBig = await contract.getWithdrawableBalance(address);
    return ethers.utils.formatEther(amtBig._hex as string);
  };

  const updateIsUserOwner = async () => {
    const signer = getProvider().getSigner();
    const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);

    const ownerAddress: string = await contract.owner();

    setIsUserOwner(ownerAddress.toLowerCase() === address?.toLowerCase());
  };

  const updateFoodBalance = async () => {
    if (!address) return;
    const currentFood = await getCurrentFood();
    setCurrentFoodBalance(currentFood);

    const foodInContract = await getEthInContract();
    setTotalFoodInContract(ethers.utils.formatEther(foodInContract));
  };

  useEffect(() => {
    updateFoodBalance();
    updateIsUserOwner();
  }, [address, updateFoodBalance, updateIsUserOwner]);

  const depositFood = async () => {
    try {
      const signer = getProvider().getSigner();
      const contract = new ethers.Contract(
        PET_ADDRESS,
        petContract.abi,
        signer
      );

      const receipt = await contract.depositFood({
        value: ethers.utils.parseEther(depositAmount.toString()),
      });
      await receipt.wait();

      await updateFoodBalance();
    } catch (err) {
      console.log(err);
    }
  };

  // const withdrawFood = async () => {
  //   const signer = getProvider().getSigner();
  //   const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);

  //   const receipt = await contract.withdrawFood(
  //     address,
  //     ethers.utils.parseEther(withdrawAmount.toString())
  //   );
  //   await receipt.wait();

  //   await updateFoodBalance();
  // };

  const getEthInContract = async () => {
    const provider = getProvider();
    return await provider.getBalance(PET_ADDRESS);
  };

  const ownerWithdrawFood = async () => {
    const signer = getProvider().getSigner();
    const contract = new ethers.Contract(PET_ADDRESS, petContract.abi, signer);
    const receipt = await contract.withdraw(
      address,
      ethers.utils.parseEther(withdrawAmount.toString())
    );
    await receipt.wait();

    await updateFoodBalance();
  };

  return (
    <div className="pt-20 container mx-auto text-gray-800">
      <div className="ml-5 font-bold text-2xl">🍖 Food Bank</div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="relative flex justify-center items-center py-2">
          <img src="/dogfood.png" />
          <div className="absolute flex items-center justify-center top-0 left-0 w-full h-full">
            <p className="font-bold text-xl text-white bg-black/50 py-2 px-4 rounded-md">
              Balance: {currentFoodBalance} ETH
            </p>
          </div>
        </div>
        <div>
          <Card>
            <div className="grid grid-cols-1 divide-y">
              <div className="pb-4 flex flex-col gap-y-2">
                <h2 className="text-2xl">Deposit</h2>
                <div className="block">
                  <Label htmlFor="depositAmount" value="Amount in ETH" />
                </div>
                <TextInput
                  id="depositAmount"
                  type="number"
                  required={true}
                  value={depositAmount}
                  onChange={(event) => {
                    setDepositAmount(parseFloat(event.target.value));
                  }}
                />
                <Button onClick={depositFood}>
                  Deposit {depositAmount} ETH
                </Button>
              </div>
              {isUserOwner && (
                <div className="pt-4 flex flex-col gap-y-2">
                  <h2 className="text-2xl">Withdraw (owner)</h2>
                  <p className="text-sm font-bold">
                    Available: {totalFoodInContract} ETH
                  </p>
                  <div className="block">
                    <Label htmlFor="withdrawAmount" value="Amount in ETH" />
                  </div>
                  <TextInput
                    id="withdrawAmount"
                    type="number"
                    required={true}
                    value={withdrawAmount}
                    onChange={(event) => {
                      setWithdrawAmount(parseFloat(event.target.value));
                    }}
                  />
                  <Button onClick={ownerWithdrawFood}>
                    Withdraw {withdrawAmount} ETH
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
