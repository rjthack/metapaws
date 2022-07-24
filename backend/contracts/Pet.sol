// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';
import '../node_modules/@openzeppelin/contracts/utils/Counters.sol';
import './FoodBank.sol';

contract Pet is FoodBank, ERC721Enumerable {
  modifier petExists(uint256 tokenId) {
    require(_exists(tokenId));
    _;
  }

  event onPetFed();
  event onPetMinted(address owner, uint256 tokenId);

  using Counters for Counters.Counter;
  Counters.Counter private tokenIds;

  uint256 public mintingFee;
  uint256 public adoptionFee;

  // The amount of food that a pet will eat
  uint256 public feedingAmount;
  uint256 public feedingInterval;

  // PER-PET FIELDS
  mapping(uint256 => uint256) internal levels;

  // Food-related
  mapping(uint256 => uint256) internal fedIntervals;
  mapping(uint256 => uint256) internal lastFedTimestamps;
  mapping(uint256 => uint256) internal maxFullnessLevels;
  mapping(uint256 => uint256) internal fullnessLevels;
  mapping(uint256 => uint256) internal adoptionCount;
  mapping(uint256 => bool) internal isDead;

  constructor(
    uint256 _mintingFee,
    uint256 _adoptionFee,
    uint256 _feedingAmount,
    uint256 _feedingInterval
  ) ERC721('Metapaws', 'MP') {
    mintingFee = _mintingFee;
    adoptionFee = _adoptionFee;
    feedingAmount = _feedingAmount;
    feedingInterval = _feedingInterval;
  }

  // Feeding override
  function depositFood() public payable override {
    // Update pets' statuses first
    _updatePetsOf(msg.sender);

    // Deposit food
    super.depositFood();
  }

  // Withdraw override
  function getWithdrawableBalance(address owner)
    public
    view
    override
    returns (uint256)
  {
    uint256 consumedFood = 0;
    // Loop through all pets
    uint256 tokenCount = balanceOf(owner);

    for (uint256 i = 0; i < tokenCount; i++) {
      uint256 tokenId = tokenOfOwnerByIndex(owner, i);

      if (isDead[tokenId]) {
        continue;
      }

      uint256 elapsedIntervals = getIntervalsSinceLastUpdate(tokenId);
      uint256 food = feedingAmount * elapsedIntervals;

      consumedFood += food;
    }

    uint256 foodBalance = getFoodBalance(owner);
    uint256 withdrawableBalance = foodBalance > consumedFood
      ? foodBalance - consumedFood
      : 0;
    return withdrawableBalance;
  }

  // Owner-only functions
  function setFeedingAmount(uint256 _feedingAmount) public onlyOwner {
    feedingAmount = _feedingAmount;
  }

  function setFeedingInterval(uint256 _feedingInterval) public onlyOwner {
    feedingInterval = _feedingInterval;
  }

  function setMintingFee(uint256 _mintingFee) public onlyOwner {
    mintingFee = _mintingFee;
  }

  function mintPet(address _to, uint256 _maxFullnessLevel) public payable {
    require(msg.value >= mintingFee, 'Not enough ether!');
    tokenIds.increment();
    uint256 tokenId = tokenIds.current();
    _safeMint(_to, tokenId);

    // Initialize stats
    maxFullnessLevels[tokenId] = _maxFullnessLevel;
    fullnessLevels[tokenId] = _maxFullnessLevel;
    lastFedTimestamps[tokenId] = block.timestamp;

    // Add to contribution stats
    increaseContributionStatistics(msg.sender, msg.value);

    //Emit minted event
    emit onPetMinted(_to, tokenId);
  }

  function _updatePet(uint256 tokenId) internal petExists(tokenId) {
    uint256 intervalsWithFood = getIntervalsWithFood(tokenId);
    fedIntervals[tokenId] += intervalsWithFood;
    lastFedTimestamps[tokenId] += intervalsWithFood * feedingInterval;
    if (hasStarvedToDeath(tokenId)) {
      isDead[tokenId] = true;
    }
  }

  function _updatePetsOf(address owner) internal {
    uint256 tokenCount = balanceOf(owner);
    require(tokenCount > 0, 'Owner address does not own any pets');
    for (uint256 i = 0; i < tokenCount; i++) {
      uint256 tokenId = tokenOfOwnerByIndex(owner, i);

      // Update if the pet has died
      _updatePet(tokenId);
    }
  }

  function updatePetsOf(address tokenOwner) public {
    require(
      msg.sender == tokenOwner || msg.sender == owner(),
      'You are not the owner of the pets or the contract'
    );
    _updatePetsOf(tokenOwner);
  }

  function getOwnerPets(address tokenOwner)
    public
    view
    returns (uint256[] memory)
  {
    uint256 balance = balanceOf(tokenOwner);
    uint256[] memory tokens = new uint256[](balance);
    for (uint256 i = 0; i < balance; i++) {
      tokens[i] = tokenOfOwnerByIndex(tokenOwner, i);
    }
    return tokens;
  }

  function getPetData(uint256 tokenId)
    public
    view
    returns (
      uint256,
      uint256,
      uint256,
      uint256,
      uint256,
      bool
    )
  {
    return (
      getIntervalsSinceLastUpdate(tokenId),
      getFullnessLevel(tokenId),
      getLastFedTimestamp(tokenId),
      getMaxFullnessLevel(tokenId),
      getAdoptionCount(tokenId),
      hasStarvedToDeath(tokenId)
    );
  }

  function getAdoptionCount(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256)
  {
    return adoptionCount[tokenId];
  }

  function getIntervalsSinceLastUpdate(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256)
  {
    uint256 durationSinceLastFed = block.timestamp -
      getLastFedTimestamp(tokenId);

    // Rounded down; i.e., number of fully depleted levels
    uint256 elapsedIntervals = durationSinceLastFed / feedingInterval;

    return elapsedIntervals;
  }

  function getIntervalsWithFood(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256)
  {
    // Eat amount of food corresponding to the depleted fullness
    address petOwner = ownerOf(tokenId);
    uint256 availableFood = getFoodBalance(petOwner);
    uint256 availableLevels = availableFood / feedingAmount;
    return availableLevels;
  }

  function getFullnessLevel(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256)
  {
    uint256 requiredLevels = getIntervalsSinceLastUpdate(tokenId);

    // Assume that one food will instantly to completely full
    uint256 availableLevels = getIntervalsWithFood(tokenId);

    uint256 depletedFullness = requiredLevels <= availableLevels
      ? 0
      : requiredLevels - availableLevels;

    uint256 maxFullness = getMaxFullnessLevel(tokenId);
    uint256 newFullnessLevel = maxFullness > depletedFullness
      ? maxFullness - depletedFullness
      : 0;

    return newFullnessLevel;
  }

  function getLastFedTimestamp(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256)
  {
    return lastFedTimestamps[tokenId];
  }

  function getMaxFullnessLevel(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (uint256)
  {
    return maxFullnessLevels[tokenId];
  }

  function hasStarvedToDeath(uint256 tokenId)
    public
    view
    petExists(tokenId)
    returns (bool)
  {
    return isDead[tokenId] || getFullnessLevel(tokenId) == 0;
  }

  function adoptDeadPet(address recipient, uint256 tokenId)
    public
    payable
    petExists(tokenId)
  {
    require(hasStarvedToDeath(tokenId), 'Pet is not yet dead');
    require(msg.value >= adoptionFee, 'Not enough ether to pay adoption fee');

    _updatePet(tokenId);
    _transfer(ownerOf(tokenId), recipient, tokenId);
    isDead[tokenId] = false;
    adoptionCount[tokenId]++;
    lastFedTimestamps[tokenId] = block.timestamp;
  }
}
