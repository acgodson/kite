// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract KiteVault is ERC4626, Ownable(msg.sender) {
    uint256 public rewardsApplicable;
    address public immutable _owner;
    ERC20 private immutable _asset;

    address[] public liquidityProviders;

    enum PaymentInterval {
        Daily,
        Weekly,
        Monthly
    }

    struct Trade {
        uint256 total;
        uint256 settled;
        uint256[] dueDates;
        uint256[] amounts;
        bool[] paidDueDates;
        bool closed;
    }

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
            // Initialize the trade for the first payment
            trade.dueDates = initiateDueDates(
                currentTimestamp,
                splitsCount,
                PaymentInterval(interval)
            );
            trade.total = total;
            trade.closed = false;
            trade.amounts = new uint256[](trade.dueDates.length);
            uint256 amountPerSplit = total / trade.dueDates.length;
            for (uint256 i = 0; i < trade.dueDates.length; i++) {
                trade.amounts[i] = amountPerSplit;
            }
            trade.paidDueDates = new bool[](trade.dueDates.length);
        }

        // Fetch the remaining splits details
        // Fetch the remaining splits details
        (
            uint256[] memory remainingAmounts,
            uint256[] memory dueDates
        ) = getRemainingSplits(campaignID, tradeId);

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

    // Function to calculate remaining balance and shares among due dates

    function getTradeDetails(
        uint256 campaignID,
        uint256 tradeId
    )
        external
        view
        returns (
            uint256 total,
            uint256 settled,
            uint256[] memory dueDates,
            bool closed
        )
    {
        Trade storage trade = trades[campaignID][tradeId];
        return (trade.total, trade.settled, trade.dueDates, trade.closed);
    }

    function getSplits(
        uint256 _campaignID,
        uint256 _tradeId
    )
        external
        view
        returns (uint256[] memory amounts, uint256[] memory dueDates)
    {
        return getRemainingSplits(_campaignID, _tradeId);
    }

    function getRemainingSplits(
        uint256 campaignID,
        uint256 tradeId
    )
        internal
        view
        returns (uint256[] memory remainingAmounts, uint256[] memory dueDates)
    {
        Trade storage trade = trades[campaignID][tradeId];

        uint256 unpaidCount = 0;
        for (uint256 i = 0; i < trade.dueDates.length; i++) {
            if (!trade.paidDueDates[i]) {
                unpaidCount++;
            }
        }

        dueDates = new uint256[](unpaidCount);
        remainingAmounts = new uint256[](unpaidCount);

        uint256 j = 0;
        for (uint256 i = 0; i < trade.dueDates.length; i++) {
            if (!trade.paidDueDates[i]) {
                dueDates[j] = trade.dueDates[i];
                remainingAmounts[j] = trade.amounts[i]; // Return the amount for the due date
                j++;
            }
        }

        return (remainingAmounts, dueDates);
    }

    function calculateDueDates(
        uint256 _splitsCount,
        PaymentInterval _interval
    ) external view returns (uint256[] memory dueDates) {
        return initiateDueDates(block.timestamp, _splitsCount, _interval);
    }

    function initiateDueDates(
        uint256 currentTimestamp,
        uint256 splitsCount,
        PaymentInterval interval
    ) internal pure returns (uint256[] memory dueDates) {
        // Calculate the first due date based on the current timestamp
        uint256 nextDueDate = currentTimestamp;

        // Set the interval for subsequent due dates
        uint256 intervalInSeconds;

        if (interval == PaymentInterval.Daily) {
            intervalInSeconds = 1 days;
        } else if (interval == PaymentInterval.Weekly) {
            intervalInSeconds = 7 days;
        } else if (interval == PaymentInterval.Monthly) {
            intervalInSeconds = 30 days; // Assuming a month is 30 days
        }
        dueDates = new uint256[](splitsCount);
        for (uint256 i = 0; i < splitsCount; i++) {
            dueDates[i] = nextDueDate;
            nextDueDate = nextDueDate + intervalInSeconds;
        }
        return dueDates;
    }

    function checkBlock() external view returns (uint256) {
        return block.timestamp;
    }


    
}
