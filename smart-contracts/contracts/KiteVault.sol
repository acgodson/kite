// SPDX-License-Identifier: MIT

pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

//the vault contract can only be called by kiteMain Address which owns it. So we will hardcode the address at some point

contract KiteVault is ERC4626, Ownable {
    uint256 public rewardsApplicable;
    address public immutable _owner;
    ERC20 private immutable _asset;

    address[] public liquidityProviders;

    constructor(ERC20 asset) ERC4626(asset) ERC20("Kit Tokens", "KIT") {
        _asset = asset;
        _owner = msg.sender;
    }

    //only the owner of contract (kitemain) can call the withdraw function
    function withdraw() external onlyOwner {}
}
