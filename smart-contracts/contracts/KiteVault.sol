// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

// Import the helper contract
import "./KiteVaultHelpers.sol";

contract KiteVault is ERC4626, Ownable(msg.sender), KiteVaultHelpers {
    uint256 public rewardsApplicable;
    address public immutable _owner;
    ERC20 private immutable _asset;

    address[] public liquidityProviders;

    // Mapping to store trades by campaign ID
    mapping(uint256 => mapping(uint256 => Trade)) public trades;

    // Event emitted when a trade is executed
    event TradeExecuted(
        uint256 campaignID,
        uint256 tradeId,
        uint256 totalShares,
        uint256 lastInterval
    );

    constructor(ERC20 asset) ERC4626(asset) ERC20("Kit Tokens", "KIT") {
        _asset = asset;
        _owner = msg.sender;
    }

    function deposit(
        uint256 assets,
        address receiver
    ) public override returns (uint256) {
        uint256 shares = previewDeposit(assets);
        _deposit(_msgSender(), msg.sender, assets, shares);
    }

    function prev() public view returns (uint256 maxAssets) {
        maxAssets = maxDeposit(msg.sender);
        return maxAssets;
    }

    function withdraw() public returns (uint256) {
        uint256 maxAssets = maxWithdraw(msg.sender);
        uint256 shares = previewWithdraw(maxAssets);
        _withdraw(_msgSender(), msg.sender, msg.sender, maxAssets, shares);
        return shares;
    }

    // Function to start a trade
    function executeTrade(
        uint256 campaignID,
        uint256 tradeId,
        uint256 splitsCount,
        uint256 interval,
        uint256 total,
        uint256 paymentAmount
    ) external onlyOwner {
        Trade storage trade = trades[campaignID][tradeId];
        uint256 currentTimestamp = block.timestamp;

        if (trade.total == 0) {
            initiateTrade(
                trade,
                currentTimestamp,
                splitsCount,
                KiteVaultHelpers.PaymentInterval(interval),
                total
            );
        }

        // Fetch the remaining splits details
        (uint256[] memory remainingAmounts, uint256[] memory dueDates) = super
            .getRemainingSplits(trade);

        require(remainingAmounts.length > 0, "No remaining splits to process");

        uint256 nextPaymentAmount = remainingAmounts[0];
        uint256 nextDueDate = dueDates[0];

        // Check if the provided payment amount is equal or greater than the next payment amount
        require(
            paymentAmount >= nextPaymentAmount,
            "Insufficient amount for the next payment"
        );

        require(currentTimestamp >= nextDueDate, "Next payment is not due yet");

        for (uint256 i = 0; i < trade.dueDates.length; i++) {
            if (trade.dueDates[i] == nextDueDate) {
                trade.paidDueDates[i] = true;
                trade.settled += nextPaymentAmount;
                break; // We found the next due date and processed it
            }
        }

        emit TradeExecuted(campaignID, tradeId, trade.total, trade.settled);
    }

    function getSplits(
        uint256 _campaignID,
        uint256 _tradeId
    )
        external
        view
        returns (uint256[] memory amounts, uint256[] memory dueDates)
    {
        Trade storage trade = trades[_campaignID][_tradeId];
        return super.getRemainingSplits(trade);
    }
}
