// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    uint8 private _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply
    ) ERC20(name, symbol) {
        // Determine decimals based on symbol for consistency with common tokens
        if (keccak256(bytes(symbol)) == keccak256(bytes("USDT")) || 
            keccak256(bytes(symbol)) == keccak256(bytes("USDC"))) {
            _decimals = 6;
        } else {
            _decimals = 18;
        }
        
        _mint(msg.sender, totalSupply);
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}