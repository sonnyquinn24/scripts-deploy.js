// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SEQToken is ERC20, Ownable {
    constructor(
        uint256 totalSupply,
        address owner,
        address icoContract
    ) ERC20("SEQ Token", "SEQ") {
        // Mint 10% to owner, 90% to ICO contract
        uint256 ownerAmount = (totalSupply * 10) / 100;
        uint256 icoAmount = totalSupply - ownerAmount;
        
        _mint(owner, ownerAmount);
        _mint(icoContract, icoAmount);
        
        // Transfer ownership to the specified owner
        _transferOwnership(owner);
    }
}