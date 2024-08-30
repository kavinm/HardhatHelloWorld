// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract HelloWorld {
    // Events to emit messages
    event NewGreeting(address indexed sender, string message, uint256 timestamp);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    // Variables
    string public greeting;
    address public owner;
    uint256 public lastUpdated;

    // Modifier to restrict access to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    // Main constructor run at deployment
    constructor(string memory _greeting) {
        owner = msg.sender;
        greeting = _greeting;
        lastUpdated = block.timestamp;
        emit NewGreeting(msg.sender, _greeting, block.timestamp);
    }

    // Get function for the greeting
    function getGreeting() public view returns (string memory) {
        return greeting;
    }

    // Set function to update the greeting, restricted to owner
    function setGreeting(string memory _greeting) public onlyOwner {
        greeting = _greeting;
        lastUpdated = block.timestamp;
        emit NewGreeting(msg.sender, _greeting, block.timestamp);
    }

    // Function to transfer ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner must be a valid address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
