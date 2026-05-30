// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract VulnerableContract {
    mapping(address => uint256) public balances;
    uint256 public totalSupply;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
        totalSupply += msg.value;
    }

    // Reentrancy vulnerability - external call before state update
    function withdraw(uint256 amount) public {
        require(balances[msg.sender] >= amount);
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success);
        
        balances[msg.sender] -= amount;
        totalSupply -= amount;
    }

    // Access control issue - no modifier
    function emergencyWithdraw(address recipient, uint256 amount) public {
        (bool success, ) = recipient.call{value: amount}("");
        require(success);
    }

    // Use of tx.origin - critical vulnerability
    function isOwner() public view returns (bool) {
        return tx.origin == msg.sender;
    }

    // Integer overflow vulnerability (Solidity < 0.8)
    function add(uint256 a, uint256 b) public pure returns (uint256) {
        return a + b;
    }

    // Unsafe delegatecall
    function delegatecallExecute(address target, bytes memory data) public {
        (bool success, ) = target.delegatecall(data);
        require(success);
    }
}
