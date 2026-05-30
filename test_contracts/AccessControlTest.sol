// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AccessControlTest {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Vulnerable: no onlyOwner modifier or require checks in preceding characters
    function setOwner(address newOwner) public {
        owner = newOwner;
    }
}
