// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TxOriginTest {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    // Vulnerable: using tx.origin for authorization
    function transferOwnership(address newOwner) public {
        require(tx.origin == owner, "Not owner");
        owner = newOwner;
    }
}
