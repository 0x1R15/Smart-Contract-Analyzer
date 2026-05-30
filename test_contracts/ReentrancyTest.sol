// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReentrancyTest {
    mapping(address => uint256) public balances;

    function withdraw(uint256 amount) public {
        if (balances[msg.sender] >= amount) {
            // Vulnerability: state variable updated after external call
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transfer failed");
            balances[msg.sender] -= amount;
        }
    }
}
