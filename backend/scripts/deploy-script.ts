import hre from 'hardhat';

async function main() {
  const pets = await hre.ethers.getContractFactory('Pet');

  // About $2 a day to feed a dog
  // Roughly 0.00062 ETH a day
  // Roughly 0.000000071 ETH per 10 seconds
  const feedingAmountEth = hre.ethers.utils.parseEther('0.000000071');
  const feedingInterval = 10;
  const mintingFee = hre.ethers.utils.parseEther('0.05');
  const adoptionFee = hre.ethers.utils.parseEther('0.025');
  const petsDeployer = await pets.deploy(
    mintingFee,
    adoptionFee,
    feedingAmountEth,
    feedingInterval
  );
  await petsDeployer.deployed();

  console.log(`Deployed to: ${petsDeployer.address}`);
}

(async () => {
  await main();
})();
