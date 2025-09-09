// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SEQICO is Ownable {
    IERC20 public seqToken;
    IERC20 public usdt;
    IERC20 public usdc;

    // Price per token in wei (ETH has 18 decimals)
    // Example: 0.00189 ETH per token (approximately $3.79 at $2000/ETH)
    uint256 public pricePerTokenETH;
    
    // Price per token in USDT units (USDT has 6 decimals)
    // Example: 3790000 = 3.79 USDT per token
    uint256 public pricePerTokenUSDT;
    
    // Price per token in USDC units (USDC has 6 decimals)
    // Example: 3790000 = 3.79 USDC per token
    uint256 public pricePerTokenUSDC;

    event TokensPurchased(address indexed buyer, uint256 amount, string payment);

    constructor(
        address _seqToken,
        address _usdt,
        address _usdc,
        uint256 _pricePerTokenETH,
        uint256 _pricePerTokenUSDT,
        uint256 _pricePerTokenUSDC
    ) Ownable(msg.sender) {
        seqToken = IERC20(_seqToken);
        usdt = IERC20(_usdt);
        usdc = IERC20(_usdc);
        pricePerTokenETH = _pricePerTokenETH;
        pricePerTokenUSDT = _pricePerTokenUSDT;
        pricePerTokenUSDC = _pricePerTokenUSDC;
    }

    function setSEQToken(address _seqToken) external onlyOwner {
        seqToken = IERC20(_seqToken);
    }

    function buyWithETH(uint256 tokenAmount) external payable {
        require(tokenAmount > 0, "Amount must be greater than 0");
        // Calculate required ETH: price per token * number of tokens / 1e18
        // Division by 1e18 converts from wei units to prevent overflow
        uint256 requiredETH = pricePerTokenETH * tokenAmount / 1e18;
        require(msg.value >= requiredETH, "Insufficient ETH sent");
        require(seqToken.balanceOf(address(this)) >= tokenAmount, "Not enough SEQ tokens");

        seqToken.transfer(msg.sender, tokenAmount);

        // Refund excess ETH
        if (msg.value > requiredETH) {
            payable(msg.sender).transfer(msg.value - requiredETH);
        }

        emit TokensPurchased(msg.sender, tokenAmount, "ETH");
    }

    function buyWithUSDT(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Amount must be greater than 0");
        // Calculate required USDT: price per token * number of tokens / 1e18
        uint256 requiredUSDT = pricePerTokenUSDT * tokenAmount / 1e18;
        require(seqToken.balanceOf(address(this)) >= tokenAmount, "Not enough SEQ tokens");
        require(usdt.allowance(msg.sender, address(this)) >= requiredUSDT, "Approve USDT first");

        usdt.transferFrom(msg.sender, address(this), requiredUSDT);
        seqToken.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, tokenAmount, "USDT");
    }

    function buyWithUSDC(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Amount must be greater than 0");
        // Calculate required USDC: price per token * number of tokens / 1e18
        uint256 requiredUSDC = pricePerTokenUSDC * tokenAmount / 1e18;
        require(seqToken.balanceOf(address(this)) >= tokenAmount, "Not enough SEQ tokens");
        require(usdc.allowance(msg.sender, address(this)) >= requiredUSDC, "Approve USDC first");

        usdc.transferFrom(msg.sender, address(this), requiredUSDC);
        seqToken.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, tokenAmount, "USDC");
    }

    function withdrawETH(address payable recipient) public onlyOwner {
        recipient.transfer(address(this).balance);
    }

    function withdrawERC20(address token, address recipient) public onlyOwner {
        IERC20(token).transfer(recipient, IERC20(token).balanceOf(address(this)));
    }
}
