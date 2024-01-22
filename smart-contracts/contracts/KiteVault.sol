// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

// Import the helper contract
import "./KiteVaultHelpers.sol";

//address of Deployed Kite Main
address constant _KITECORE = address(
    0x4Cf1fB6A153156c8FfE869390c5b1DEE71fEe65D
);
//address of Vault Asset / GHO
address constant _GHO = address(0xc4bF5CbDaBE595361438F8c6a187bDc330539c60);

contract KiteVault is
    AccessControl,
    ERC4626,
    Ownable(_KITECORE),
    KiteVaultHelpers
{
    address public immutable _owner;
    ERC20 private immutable _asset;

    address[] public liquidityProviders;

    // all trades
    mapping(uint256 => Trade) public trades;
    // filter tradeIDs by campaign
    mapping(uint256 => uint256[]) public campaignTrades;
    // filter tradeIDs by depositor
    mapping(address => uint256[]) public depositorTrades;
    // Shares of Depositor in GHO
    mapping(address => uint256) public depositorShares;
    // Shares of  Depositor in USDC
    mapping(address => uint256) public liquidations;

    // Event emitted when a trade is executed
    event TradeExecuted(
        uint256 campaignID,
        uint256 tradeId,
        uint256 totalShares,
        uint256 lastInterval
    );

    constructor() ERC4626(ERC20(_GHO)) ERC20("Kite Shares", "KITE") {
        _asset = ERC20(_GHO);
        _owner = msg.sender;
    }

    modifier onlyBuyer(uint256 tradeID, address sender) {
        _checkOnlyBuyer(tradeID, sender);
        _;
    }

    modifier onlyCore() {
        require(msg.sender == _KITECORE, "Caller is not the core address");
        _;
    }

    // Starts or Continues payments for a trade
    function executeTrade(
        uint256 campaignID,
        uint256 tradeId,
        uint256 splitsCount,
        uint256 interval,
        uint256 total,
        uint256 paymentAmount,
        address sender
    ) external onlyCore {
        Trade storage trade = trades[tradeId];
        uint256 currentTimestamp = block.timestamp;

        uint256 shares = previewDeposit(paymentAmount);
        _deposit(_msgSender(), msg.sender, paymentAmount, shares); //kite Core contract holds the shares
        liquidityProviders.push(sender);
        depositorShares[sender] += shares;

        //initialize new trade
        if (trade.total == 0) {
            //add deposit first
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

            //update filters
            campaignTrades[campaignID].push(tradeId);
            depositorTrades[sender].push(tradeId);
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

    //Kite withdraws GHO for liquidating USDC collaterals on Aave
    function withdrawForLiquidation(uint256 amount) external onlyCore {
        require(amount > 0, "Invalid withdrawal amount");
        // Get the total shares and check if there are shares to distribute
        uint256 totalShares = totalSupply();
        require(
            totalShares >= 0,
            "Insufficient shares available for distribution"
        );

        // Calculate the total shares available withdraw
        uint256 totalSharesToWithdraw = 0;

        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            address depositor = liquidityProviders[i];
            uint256 depositorShare = depositorShares[depositor];
            // Calculate the proportion of shares to withdraw for the current depositor
            uint256 sharesToWithdraw = (amount * depositorShare) / totalShares;
            // Update the depositor's shares
            depositorShares[depositor] -= sharesToWithdraw;
            // Update the depositor's liquidation shares
            liquidations[depositor] += sharesToWithdraw;
        }
        uint256 shares = previewWithdraw(amount);

        // Transfer the corresponding amount of assets to the receiver
        _withdraw(
            msg.sender,
            msg.sender,
            _owner,
            totalSharesToWithdraw,
            shares
        );
    }

    //Buyer pays Merchant from liquidation balance (USDC) on due date
    function payMerchant() external onlyCore {}

    //Refund buyer of remaining GHO after payment cycle
    function refund(
        uint256 tradeID,
        address sender
    ) external onlyCore onlyBuyer(tradeID, sender) {}

    //Retrieve all trades in a Campaign
    function getAllTradesInCampaign(
        uint256 campaignID
    ) external view returns (Trade[] memory) {
        uint256[] memory tradeIds = campaignTrades[campaignID];
        Trade[] memory _trades = new Trade[](tradeIds.length);

        for (uint256 i = 0; i < tradeIds.length; i++) {
            _trades[i] = trades[tradeIds[i]];
        }

        return _trades;
    }

    // Retrieve all trades by a depositor
    function getAllTradesByDepositor(
        address depositor
    ) external view returns (Trade[] memory) {
        uint256[] memory tradeIds = depositorTrades[depositor];
        Trade[] memory _trades = new Trade[](tradeIds.length);

        for (uint256 i = 0; i < tradeIds.length; i++) {
            _trades[i] = trades[tradeIds[i]];
        }

        return _trades;
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
