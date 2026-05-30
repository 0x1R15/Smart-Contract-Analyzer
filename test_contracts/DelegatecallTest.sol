// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DelegatecallTest {
    address public implementation;

    function upgradeTo(address newImplementation) public {
        implementation = newImplementation;
    }

    // Vulnerable: using delegatecall
    function callContract(address target, bytes memory data) public {
        (bool success, ) = target.delegatecall(data);
    }
}
