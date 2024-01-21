// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Interfaces.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Liquidator {
    ILendingPool internal lendingPool;
    IERC20 internal collateralAsset;

    constructor(
        address _lendingPool,
        address _collateralAsset
    ) {
        lendingPool = ILendingPool(_lendingPool);

        collateralAsset = IERC20(_collateralAsset);
    }

    function _liquidate(
        address _borrowedAsset,
        address userToLiquidate,
        uint256 amountToLiquidate
    ) internal {
      IERC20  borrowedAsset = IERC20(_borrowedAsset);
        require(
            borrowedAsset.balanceOf(address(this)) >= amountToLiquidate,
            "Insufficient GHO to liquidate"
        );
        borrowedAsset.approve(address(lendingPool), amountToLiquidate);
        lendingPool.liquidationCall(
            address(collateralAsset),
            address(borrowedAsset),
            userToLiquidate,
            amountToLiquidate,
            false
        );
    }
    }

   
