import { ethers, network } from 'hardhat';
import { expect } from 'chai';
import { Pet } from '../typechain-types';

type Unpromise<T extends Promise<any>> = T extends Promise<infer S> ? S : never;

describe('Pet contract', function () {
  const fee = ethers.utils.parseEther('0.05');
  const adoptionFee = ethers.utils.parseEther('0.025');
  const FULLNESS_LEVEL = 10;
  const DEPOSIT_LEVEL = 3;
  const FEEDING_AMOUNT = ethers.utils.parseEther('0.05');
  // Feeding interval = 500 seconds
  const FEEDING_INTERVAL = 500;

  let PetContract: Pet;

  beforeEach(async function () {
    const Pet = await ethers.getContractFactory('Pet');
    PetContract = await Pet.deploy(
      fee,
      adoptionFee,
      FEEDING_AMOUNT,
      FEEDING_INTERVAL
    );
  });

  it('User should be able to mint pets with fee', async function () {
    const [owner] = await ethers.getSigners();
    expect(
      PetContract.mintPet(owner.address, 1000, { value: fee })
    ).to.not.be.revertedWithoutReason();
  });

  it('User should not be able to mint pets without fee', async function () {
    const [owner, addr1] = await ethers.getSigners();
    const transaction = PetContract.connect(addr1).mintPet(
      addr1.address,
      1000,
      { value: 0 }
    );
    await expect(transaction).to.be.revertedWith('Not enough ether!');
  });

  it('Minted pet should have full fullness at the start', async function () {
    const [owner] = await ethers.getSigners();
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();

    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];
    const fullnessLevel = await PetContract.getFullnessLevel(tokenId);

    expect(fullnessLevel).to.equal(FULLNESS_LEVEL);
  });

  it('getIntervalsSinceLastUpdate should return 1 after 1x feedingInterval has elapsed', async function () {
    const [owner] = await ethers.getSigners();
    // Mint pet
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();
    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];

    // Advance time by 1x feeding interval
    await network.provider.send('evm_increaseTime', [FEEDING_INTERVAL]);
    await network.provider.send('evm_mine');

    const elapsedIntervals = await PetContract.getIntervalsSinceLastUpdate(
      tokenId
    );
    expect(elapsedIntervals).to.equal(1);
  });

  it('Pet should die after not getting fed for long enough', async function () {
    const [owner] = await ethers.getSigners();
    // Mint pet
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();
    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];

    const isDeadBefore = await PetContract.hasStarvedToDeath(tokenId);
    expect(isDeadBefore).to.equal(false);

    // Advance time by n feeding intervals, where n is the fullness level
    await network.provider.send('evm_increaseTime', [
      FEEDING_INTERVAL * FULLNESS_LEVEL,
    ]);
    await network.provider.send('evm_mine');

    const elapsedIntervals = await PetContract.getIntervalsSinceLastUpdate(
      tokenId
    );
    expect(elapsedIntervals).to.equal(FULLNESS_LEVEL);

    const isDeadAfter = await PetContract.hasStarvedToDeath(tokenId);
    expect(isDeadAfter).to.equal(true);
  });

  it('Player with a pet should be able to deposit into the food bank, which updates his balance correctly', async function () {
    const [owner] = await ethers.getSigners();

    // Mint pet
    await (await PetContract.mintPet(owner.address, 1, { value: fee })).wait();

    await (await PetContract.depositFood({ value: 10 })).wait();

    const foodBalance = await PetContract.getFoodBalance(owner.address);
    expect(foodBalance).to.equal(10);
  });

  // it('Player with a pet should be able to withdraw from the food bank, which updates balance and transfers him the amount correctly', async function () {
  //   const [owner] = await ethers.getSigners();
  //   const Pet = await ethers.getContractFactory('Pet');
  //   const PetContract = await Pet.deploy(fee, 1, 1);

  //   // Mint pet
  //   await (await PetContract.mintPet(owner.address, 1, { value: fee })).wait();

  //   // Deposit 10 eth
  //   const tenEth = ethers.utils.parseEther('10');
  //   await (await PetContract.depositFood({ value: tenEth })).wait();

  //   const foodBalance = await PetContract.getFoodBalance(owner.address);
  //   expect(foodBalance).to.equal(tenEth);

  //   const balanceBefore = await owner.getBalance();

  //   await (await PetContract.withdrawFood(owner.address, tenEth)).wait();

  //   const balanceAfter = await owner.getBalance();

  //   // Owner should have approximately more eth at the end
  //   expect(balanceAfter.sub(balanceBefore)).to.approximately(
  //     tenEth,
  //     ethers.utils.parseEther('0.1')
  //   );

  //   const balanceAfterInContract = await PetContract.getFoodBalance(
  //     owner.address
  //   );
  //   expect(balanceAfterInContract).to.equal(0);
  // });

  it('Pet should not be hungry at all if owner has deposited tons of food', async function () {
    const [owner] = await ethers.getSigners();
    // Mint pet
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();
    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];

    // Deposit 100 eth
    const aLotOfEth = ethers.utils.parseEther('100');
    await (await PetContract.depositFood({ value: aLotOfEth })).wait();

    // Advance time by n feeding intervals, where n is the fullness level
    // Pet would have died, if there were no food at all
    await network.provider.send('evm_increaseTime', [
      FEEDING_INTERVAL * FULLNESS_LEVEL,
    ]);
    await network.provider.send('evm_mine');

    const fullnessLevel = await PetContract.getFullnessLevel(tokenId);
    expect(fullnessLevel).to.equal(FULLNESS_LEVEL);
  });

  it('Pet should be partially hungry if owner has deposited not enough food', async function () {
    const [owner] = await ethers.getSigners();
    // Mint pet
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();
    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];

    // Deposit enough eth for 3 fullness levels
    const aLotOfEth = FEEDING_AMOUNT.mul(DEPOSIT_LEVEL);
    await (await PetContract.depositFood({ value: aLotOfEth })).wait();

    // Advance by 3 intervals, fullness should still be full
    await network.provider.send('evm_increaseTime', [
      FEEDING_INTERVAL * DEPOSIT_LEVEL,
    ]);
    await network.provider.send('evm_mine');

    const laterFullnessLevel = await PetContract.getFullnessLevel(tokenId);
    expect(laterFullnessLevel).to.equal(FULLNESS_LEVEL);

    // Advance time by 1 feeding intervals
    await network.provider.send('evm_increaseTime', [FEEDING_INTERVAL * 1]);
    await network.provider.send('evm_mine');

    const fullnessLevel = await PetContract.getFullnessLevel(tokenId);
    expect(fullnessLevel).to.equal(FULLNESS_LEVEL - 1);
  });

  it('Dead pet cannot be revived after topping up food', async function () {
    const [owner] = await ethers.getSigners();
    // Mint pet
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();
    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];

    // Advance time by n feeding intervals, where n is the fullness level
    await network.provider.send('evm_increaseTime', [
      FEEDING_INTERVAL * FULLNESS_LEVEL,
    ]);
    await network.provider.send('evm_mine');

    const isDeadAfter = await PetContract.hasStarvedToDeath(tokenId);
    expect(isDeadAfter).to.equal(true);

    const aLotOfEth = FEEDING_AMOUNT.mul(1000);
    await (await PetContract.depositFood({ value: aLotOfEth })).wait();

    const isStillDead = await PetContract.hasStarvedToDeath(tokenId);
    expect(isStillDead).to.equal(true);
  });

  // it('User should not be able to withdraw consumed food', async function () {
  //   const FULLNESS_LEVEL = 10;
  //   const DEPOSIT_LEVEL = 3;
  //   const FEEDING_AMOUNT = ethers.utils.parseEther('0.05');
  //   // Feeding interval = 500 seconds
  //   const FEEDING_INTERVAL = 500;
  //   const [owner] = await ethers.getSigners();
  //   const Pet = await ethers.getContractFactory('Pet');
  //   const PetContract = await Pet.deploy(fee, FEEDING_AMOUNT, FEEDING_INTERVAL);

  //   // Mint pet
  //   const receipt = await (
  //     await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
  //   ).wait();
  //   expect(receipt.events).to.not.be.an('undefined');
  //   const event = receipt.events!.find((event) => event.event === 'Transfer')!;
  //   const tokenId = event.args!['tokenId'];

  //   // Deposit enough eth for 3 fullness levels
  //   const aLotOfEth = FEEDING_AMOUNT.mul(DEPOSIT_LEVEL);
  //   await (await PetContract.depositFood({ value: aLotOfEth })).wait();

  //   // Advance by 3 intervals, fullness should still be full
  //   await network.provider.send('evm_increaseTime', [
  //     FEEDING_INTERVAL * DEPOSIT_LEVEL,
  //   ]);
  //   await network.provider.send('evm_mine');

  //   const withdrawableBalance = await PetContract.getWithdrawableBalance(
  //     owner.address
  //   );
  //   expect(withdrawableBalance).to.equal(0);
  // });

  it('Owner should be able to withdraw ETH from food', async function () {
    const [owner] = await ethers.getSigners();
    // Mint pet
    const receipt = await (
      await PetContract.mintPet(owner.address, FULLNESS_LEVEL, { value: fee })
    ).wait();
    expect(receipt.events).to.not.be.an('undefined');
    const event = receipt.events!.find((event) => event.event === 'Transfer')!;
    const tokenId = event.args!['tokenId'];

    // Deposit enough eth for 3 fullness levels
    const aLotOfEth = FEEDING_AMOUNT.mul(DEPOSIT_LEVEL);
    await (await PetContract.depositFood({ value: aLotOfEth })).wait();

    // Advance by 3 intervals, fullness should still be full
    await network.provider.send('evm_increaseTime', [
      FEEDING_INTERVAL * DEPOSIT_LEVEL,
    ]);
    await network.provider.send('evm_mine');

    expect(
      PetContract.withdraw(owner.address, aLotOfEth)
    ).to.not.be.revertedWithoutReason();
  });
});
