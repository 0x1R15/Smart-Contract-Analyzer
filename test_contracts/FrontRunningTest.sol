// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FrontRunningTest {
    uint256 public rewardUnlockTime;
    address public winner;

    function setUnlockTime(uint256 time) public {
        rewardUnlockTime = time;
    }

    // Vulnerable: depends on block.timestamp with state transitions
    function claimReward() public {
        require(block.timestamp >= rewardUnlockTime, "Too early");
        winner = msg.sender;
    }
}
