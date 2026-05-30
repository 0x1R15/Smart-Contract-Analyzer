// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract OverflowTest {
    uint256 public counter;

    // Vulnerable: Solidity 0.7 without SafeMath will overflow/underflow silently
    function increase(uint256 amount) public {
        counter = counter + amount;
    }
}
