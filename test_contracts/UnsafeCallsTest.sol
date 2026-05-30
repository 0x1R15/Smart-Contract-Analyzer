// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UnsafeCallsTest {
    function sendEther(address payable recipient) public payable {
        // Vulnerable: return value of call is not checked using require/assert
        recipient.call{value: msg.value}("");
    }
}
