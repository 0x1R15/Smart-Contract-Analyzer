// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GasOptimizationTest {
    struct User {
        uint256 id;
        uint256 balance;
    }

    mapping(address => User) public users;
    
    // Gas Inefficiency: Multiple storage writes
    function updateUsers(address a, address b, address c, address d) public {
        User storage u1 = users[a];
        User storage u2 = users[b];
        User storage u3 = users[c];
        User storage u4 = users[d];
        u1.balance = 100;
        u2.balance = 200;
        u3.balance = 300;
        u4.balance = 400;
    }

    // Gas Inefficiency: Multiple loops (> 2 loops)
    function processArray(uint256[] memory data) public pure returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < data.length; i++) {
            total += data[i];
        }
        for (uint256 i = 0; i < data.length; i++) {
            total += data[i] * 2;
        }
        for (uint256 i = 0; i < data.length; i++) {
            total += data[i] * 3;
        }
        return total;
    }
}
