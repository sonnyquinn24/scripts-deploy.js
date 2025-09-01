// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SEQICO is Ownable {
    IERC20 public seqToken;
    IERC20 public usdt;
    IERC20 public usdc;

    uint256 public pricePerTokenETH;
    uint256 public pricePerTokenUSDT;
    uint256 public pricePerTokenUSDC;

    // Minimum price constants (equivalent to $3 USD)
    uint256 public constant MIN_PRICE_USD = 3 * 1e6; // $3 in 6 decimal format (USDT/USDC)
    uint256 public constant MIN_PRICE_ETH = 0.001 ether; // Conservative minimum (~$3 when ETH > $3000)

    event TokensPurchased(address indexed buyer, uint256 amount, string payment);

    constructor(
        address _seqToken,
        address _usdt,
        address _usdc,
        uint256 _pricePerTokenETH,
        uint256 _pricePerTokenUSDT,
        uint256 _pricePerTokenUSDC
    ) {
        seqToken = IERC20(_seqToken);
        usdt = IERC20(_usdt);
        usdc = IERC20(_usdc);
        
        // Validate minimum prices during deployment
        require(_pricePerTokenETH >= MIN_PRICE_ETH, "Price must be greater than or equal to $3");
        require(_pricePerTokenUSDT >= MIN_PRICE_USD, "Price must be greater than or equal to $3");
        require(_pricePerTokenUSDC >= MIN_PRICE_USD, "Price must be greater than or equal to $3");
        
        pricePerTokenETH = _pricePerTokenETH;
        pricePerTokenUSDT = _pricePerTokenUSDT;
        pricePerTokenUSDC = _pricePerTokenUSDC;
    }

    function setSEQToken(address _seqToken) external onlyOwner {
        seqToken = IERC20(_seqToken);
    }

    function setPricePerTokenETH(uint256 _pricePerTokenETH) external onlyOwner {
        require(_pricePerTokenETH >= MIN_PRICE_ETH, "Price must be greater than or equal to $3");
        pricePerTokenETH = _pricePerTokenETH;
    }

    function setPricePerTokenUSDT(uint256 _pricePerTokenUSDT) external onlyOwner {
        require(_pricePerTokenUSDT >= MIN_PRICE_USD, "Price must be greater than or equal to $3");
        pricePerTokenUSDT = _pricePerTokenUSDT;
    }

    function setPricePerTokenUSDC(uint256 _pricePerTokenUSDC) external onlyOwner {
        require(_pricePerTokenUSDC >= MIN_PRICE_USD, "Price must be greater than or equal to $3");
        pricePerTokenUSDC = _pricePerTokenUSDC;
    }

    function buyWithETH(uint256 tokenAmount) external payable {
        require(tokenAmount > 0, "Amount must be greater than 0");
        uint256 requiredETH = pricePerTokenETH * tokenAmount / 1e18; // Properly account for token decimals
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
        uint256 requiredUSDT = pricePerTokenUSDT * tokenAmount / 1e18;
        require(seqToken.balanceOf(address(this)) >= tokenAmount, "Not enough SEQ tokens");
        require(usdt.allowance(msg.sender, address(this)) >= requiredUSDT, "Approve USDT first");

        usdt.transferFrom(msg.sender, address(this), requiredUSDT);
        seqToken.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, tokenAmount, "USDT");
    }

    function buyWithUSDC(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Amount must be greater than 0");
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