// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract SEQICO {
    address public token;
    address public usdtAddress;
    address public usdcAddress;
    uint256 public pricePerTokenETH;
    uint256 public pricePerTokenUSDT;
    uint256 public pricePerTokenUSDC;

    constructor(
        address _token,
        address _usdtAddress,
        address _usdcAddress,
        uint256 _pricePerTokenETH,
        uint256 _pricePerTokenUSDT,
        uint256 _pricePerTokenUSDC
    ) {
        token = _token;
        usdtAddress = _usdtAddress;
        usdcAddress = _usdcAddress;
        pricePerTokenETH = _pricePerTokenETH;
        pricePerTokenUSDT = _pricePerTokenUSDT;
        pricePerTokenUSDC = _pricePerTokenUSDC;
    }
}