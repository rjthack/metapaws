// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import '../node_modules/@openzeppelin/contracts/security/ReentrancyGuard.sol';
import '../node_modules/@openzeppelin/contracts/access/Ownable.sol';

contract FoodBank is ReentrancyGuard, Ownable {
  constructor() {}

  function _withdrawETH(address payable recipient, uint256 amount) internal {
    (bool succeed, ) = recipient.call{value: amount}('');
    require(succeed, 'Failed to withdraw Ether');
  }

  function withdraw(address payable recipient, uint256 amount)
    public
    onlyOwner
    nonReentrant
  {
    _withdrawETH(recipient, amount);
  }

  // PER-OWNER FIELDS
  mapping(address => uint256) private foodBalances;
  mapping(address => uint256) private totalFoodContributed;

  uint256 private totalFoodPurchased = 0; //Total eth given for food

  function getFoodBalance(address owner) public view returns (uint256) {
    return foodBalances[owner];
  }

  function getTotalFoodContributed(address owner)
    public
    view
    returns (uint256)
  {
    return totalFoodContributed[owner];
  }

  function increaseContributionStatistics(address contributor, uint256 value)
    internal
  {
    totalFoodContributed[contributor] += value;
    totalFoodPurchased += value;
  }

  function depositFood() public payable virtual nonReentrant {
    require(msg.value > 0, 'Food amount cannot be 0');
    foodBalances[msg.sender] += msg.value;
    increaseContributionStatistics(msg.sender, msg.value);
  }

  function getTotalGlobalPurchased() public view returns (uint256) {
    return totalFoodPurchased;
  }

  function getWithdrawableBalance(address owner)
    public
    view
    virtual
    returns (uint256)
  {
    return foodBalances[owner];
  }

  // function withdrawFood(address payable recipient, uint256 amount)
  //   public
  //   payable
  //   virtual
  //   nonReentrant
  // {
  //   require(
  //     amount <= getWithdrawableBalance(msg.sender),
  //     'Cannot withdraw more food than amount available in balance'
  //   );
  //   foodBalances[msg.sender] -= amount;
  //   totalFoodContributed[msg.sender] -= amount;
  //   totalFoodPurchased -= amount;
  //   _withdrawETH(recipient, amount);
  // }
}
