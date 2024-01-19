//SPDX-License-Identifier:MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestUSDC is ERC20{

    constructor() ERC20("USDC","USDC"){
        _mint(msg.sender,100000*10**6);
    }
}