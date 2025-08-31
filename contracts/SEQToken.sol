// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SEQToken is ERC20 {
    constructor(
        uint256 totalSupply,
        address owner,
        address ico
    ) ERC20("SEQ Token", "SEQ") {
        require(owner != address(0), "Owner address cannot be zero");
        require(ico != address(0), "ICO address cannot be zero");
        uint256 ownerAmount = (totalSupply * 10) / 100; // 10%
        uint256 icoAmount = totalSupply - ownerAmount;  // 90%
        _mint(owner, ownerAmount);
        _mint(ico, icoAmount);
    }
}