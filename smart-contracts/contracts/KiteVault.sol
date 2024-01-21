// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

// Import the helper contract
import "./KiteVaultHelpers.sol";

address constant _KITECORE = address(
    0xeFc6B96a9A3Db8B741e85DFFdCb8201Ae97C6380
);

contract KiteVault is
    AccessControl,
    ERC4626,
    Ownable(_KITECORE),
    KiteVaultHelpers
{
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

    constructor(ERC20 asset) ERC4626(asset) ERC20("Kite Shares", "KITE") {
        _asset = asset;
        _owner = _KITECORE;
    }

    modifier onlyBuyer(uint256 tradeID, address sender) {
        _checkOnlyBuyer(tradeID, sender);
        _;
    }

    modifier onlyCore() {
        require(msg.sender == _KITECORE, "Caller is not the core address");
        _;
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
    ) external onlyCore {
        Trade storage trade = trades[campaignID][tradeId];
        uint256 currentTimestamp = block.timestamp;

        //initialize new trade
        if (trade.total == 0) {
            trade.dueDates = initiateDueDates(
                currentTimestamp,
                splitsCount,
                KiteVaultHelpers.PaymentInterval(interval)
            );
            trade.total = total;
            trade.closed = false;
            trade.amounts = new uint256[](trade.dueDates.length);
            uint256 amountPerSplit = total / trade.dueDates.length;
            for (uint256 i = 0; i < trade.dueDates.length; i++) {
                trade.amounts[i] = amountPerSplit;
            }
            trade.paidDueDates = new bool[](trade.dueDates.length);
            bytes32 Buyer_ROLE = keccak256(abi.encodePacked(tradeId, "buyer"));
            _grantRole(Buyer_ROLE, msg.sender);
        }

        // Fetch the remaining splits details
        (uint256[] memory remainingAmounts, uint256[] memory dueDates) = super
            .getRemainingSplits(trade);

        require(remainingAmounts.length > 0, "No remaining splits to process");

        uint256 nextPaymentAmount = remainingAmounts[0];
        uint256 nextDueDate = dueDates[0];

        require(
            paymentAmount >= nextPaymentAmount,
            "Insufficient amount for the next payment"
        );

        require(currentTimestamp >= nextDueDate, "Next payment is not due yet");

        for (uint256 i = 0; i < trade.dueDates.length; i++) {
            if (trade.dueDates[i] == nextDueDate) {
                trade.paidDueDates[i] = true;
                trade.settled += nextPaymentAmount;
                break;
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

    function _checkOnlyBuyer(uint256 tradeId, address sender) internal view {
        if (!_isCampaignBuyer(tradeId, sender)) revert("UNAUTHORIZED");
    }

    function _isCampaignBuyer(
        uint256 tradeId,
        address _address
    ) internal view returns (bool) {
        bytes32 Buyer_ROLE = keccak256(abi.encodePacked(tradeId, "buyer"));
        return hasRole(Buyer_ROLE, _address);
    }
}
