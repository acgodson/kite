// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "./KiteVault.sol";
import "./Liquidator.sol";

address constant _POOL = address(0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951);
address constant _COLLATERAL = address(
    0x88233eEc48594421FA925D614b3a94A2dDC19a08
);
address constant _ROUTER = address(0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59);

address constant GHO = address(0xc4bF5CbDaBE595361438F8c6a187bDc330539c60);

// 0x5F554bA42Ae9b67D4696060171b0Ea20b6aA9541

contract KiteMain is
    Liquidator(_POOL, _COLLATERAL),
    AutomationCompatibleInterface,
    CCIPReceiver
{
    uint256 public campaignIdCounter;
    uint256 public immutable interval;
    uint256 public lastTimeStamp;

    enum PaymentInterval {
        Daily,
        Weekly,
        Monthly
    }

    struct Campaign {
        uint256 campaignId;
        address vaultAddress;
        uint256 interestRate;
        PaymentInterval paymentInterval;
        uint256 splitsCount;
        address owner;
    }

    struct UpkeepLoans {
        address userToLiquidate;
        uint256 amountToLiquidate;
    }

    UpkeepLoans[] public arbitrages; //unhealth loans to liquidate

    mapping(uint256 => uint256) private tradeCounters;
    mapping(address => uint256[]) public campaignIdsByAddress;
    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 campaignId, address indexed campaignAddress);

    constructor() CCIPReceiver(_ROUTER) {
        interval = 60; //check for liquidation opportunity every 60secs
    }

    //Anybody can create a campaign
    function createCampaign(
        uint256 _interestRate,
        address _vaultAddress,
        PaymentInterval _paymentInterval,
        uint256 _splitsCount
    ) external {
        require(_interestRate > 0, "Interest rate must be greater than 0");
        require(_splitsCount > 0, "Max duration must be greater than 0");

        _createCampaign(
            _interestRate,
            _vaultAddress,
            _paymentInterval,
            _splitsCount,
            msg.sender
        );
    }

    // Function to initiate a trade
    function initiateTrade(
        uint256 campaignID,
        uint256 total,
        uint256 amount
    ) external {
        uint256 tradeId = tradeCounters[campaignID] + 1;

        Campaign storage campaign = campaigns[campaignID];
        address vaultAddress = campaign.vaultAddress;

        require(IERC20(GHO).approve(vaultAddress, amount), "Approval failed");

        require(
            IERC20(GHO).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        tradeCounters[campaignID] = ++tradeId;

        KiteVault(vaultAddress).executeTrade(
            campaignID,
            tradeId,
            campaign.splitsCount,
            uint256(campaign.paymentInterval),
            total,
            amount,
            msg.sender
        );
    }

    function liquidate(
        uint256 campaignID,
        uint256 tradeID,
        address userToLiquidate,
        uint256 amountToLiquidate
    ) external {
        Campaign storage campaign = campaigns[campaignID];
        address vaultAddress = campaign.vaultAddress;
        address _vaultAsset = KiteVault(vaultAddress).asset();

        //logic to quickly burn and retrieve borrowed Asset from the  vault
        _liquidate(_vaultAsset, userToLiquidate, amountToLiquidate);
    }

    function getCampaignsByAddress(address _userAddress)
        public
        view
        returns (Campaign[] memory)
    {
        uint256[] storage campaignIds = campaignIdsByAddress[_userAddress];
        Campaign[] memory userCampaigns = new Campaign[](campaignIds.length);

        for (uint256 i = 0; i < campaignIds.length; i++) {
            userCampaigns[i] = campaigns[campaignIds[i]];
        }

        return userCampaigns;
    }

    function calculateNextPayment(
        uint256 campaignID,
        uint256 tradeId,
        uint256 amount
    ) internal view returns (uint256) {
        Campaign storage campaign = campaigns[campaignID];

        // Get the trade details using getTradeDetails
        (uint256[] memory amounts, uint256[] memory dueDates) = KiteVault(
            campaign.vaultAddress
        ).getSplits(campaignID, tradeId);

        if (dueDates.length == 0) {
            return (campaign.interestRate * amount) / campaign.splitsCount;
        }

        require(amounts.length > 0, "No remaining splits to process");

        uint256 nextPaymentAmount = amounts[0];
        // uint256 nextDueDate = dueDates[0];

        return nextPaymentAmount;
    }

    function _createCampaign(
        uint256 _interestRate,
        address _vaultAddress,
        PaymentInterval _paymentInterval,
        uint256 _splitsCount,
        address sender
    ) internal {
        campaignIdCounter++;
        campaigns[campaignIdCounter] = Campaign({
            campaignId: campaignIdCounter,
            vaultAddress: _vaultAddress,
            interestRate: _interestRate,
            paymentInterval: _paymentInterval,
            splitsCount: _splitsCount,
            owner: sender
        });

        campaignIdsByAddress[sender].push(campaignIdCounter);

        emit CampaignCreated(campaignIdCounter, sender);
    }

    //Chainlink Functions starts here
    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage)
        internal
        override
    {
        //We'll receive a crosschain message to create a new campaign
        (
            uint256 _interestRate,
            address _vaultAddress,
            PaymentInterval _paymentInterval,
            uint256 _splitsCount,
            address _sender
        ) = decodeMessage(any2EvmMessage.data);

        require(_interestRate > 0, "Interest rate must be greater than 0");
        require(_splitsCount > 0, "Max duration must be greater than 0");

        _createCampaign(
            _interestRate,
            _vaultAddress,
            _paymentInterval,
            _splitsCount,
            _sender
        );
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    )
        external
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        upkeepNeeded =
            (block.timestamp - lastTimeStamp) > interval &&
            arbitrages.length > 0;
    }

    //Perfrom Liquidation
    function performUpkeep(
        bytes calldata /* performData */
    ) external override {
        if (
            (block.timestamp - lastTimeStamp) > interval &&
            arbitrages.length > 0
        ) {
            // Create a new array to store salts that you want to keep
            // bytes32[] memory remainingLoans = new bytes32[](arbitrages.length);

            // for (uint256 i = 0; i < arbitrages.length; i++) {

            // }
            // salts = new bytes32[](0);
            lastTimeStamp = block.timestamp;
        }
    }

    function decodeMessage(bytes memory data)
        internal
        pure
        returns (
            uint256 interestRate,
            address vaultAddress,
            PaymentInterval paymentInterval,
            uint256 splitsCount,
            address owner
        )
    {
        (
            uint256 _interestRate,
            address _vaultAddress,
            uint8 _paymentInterval,
            uint256 _splitsCount,
            address _owner
        ) = abi.decode(data, (uint256, address, uint8, uint256, address));
        interestRate = _interestRate;
        vaultAddress = _vaultAddress;
        paymentInterval = PaymentInterval(_paymentInterval);
        splitsCount = _splitsCount;
        owner = _owner;

        return (
            interestRate,
            vaultAddress,
            paymentInterval,
            splitsCount,
            owner
        );
    }
}
