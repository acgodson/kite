// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "./KiteVault.sol";

contract KiteMain is AccessControl {
    address public admin;
    uint256 public campaignIdCounter;

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
    }

    mapping(uint256 => uint256) private tradeCounters;
    mapping(address => uint256[]) public campaignIdsByAddress;
    mapping(uint256 => Campaign) public campaigns;

    event CampaignCreated(uint256 campaignId, address indexed campaignAddress);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin(uint256 campaignID, address sender) {
        _checkOnlyAdmin(campaignID, sender);
        _;
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

        campaignIdCounter++;
        campaigns[campaignIdCounter] = Campaign({
            campaignId: campaignIdCounter,
            vaultAddress: _vaultAddress,
            interestRate: _interestRate,
            paymentInterval: _paymentInterval,
            splitsCount: _splitsCount
        });

        campaignIdsByAddress[msg.sender].push(campaignIdCounter);

        bytes32 ADMIN_ROLE = keccak256(
            abi.encodePacked(campaignIdCounter, "admin")
        );
        _grantRole(ADMIN_ROLE, msg.sender);
        emit CampaignCreated(campaignIdCounter, msg.sender);
    }

    // Function to initiate a trade
    function initiateTrade(
        uint256 campaignID,
        uint256 total,
        uint256 amount
    ) external {
        uint256 tradeId = tradeCounters[campaignID] + 1;
        require(
            amount >= calculateNextPayment(campaignID, tradeId, amount),
            "Insufficient amount for initial payment"
        );
        Campaign storage campaign = campaigns[campaignID];
        address vaultAddress = campaign.vaultAddress;

        tradeCounters[campaignID] = ++tradeId;
        KiteVault(vaultAddress).executeTrade(
            campaignID,
            tradeId,
            campaign.splitsCount,
            uint256(campaign.paymentInterval),
            total,
            amount
        );
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
        uint256 nextDueDate = dueDates[0];

        return nextPaymentAmount;
    }

    function getCampaignIdsByAddress(
        address _projectAddress
    ) external view returns (uint256[] memory) {
        return campaignIdsByAddress[_projectAddress];
    }

    function _checkOnlyAdmin(uint256 campaignId, address sender) internal view {
        if (!_isCampaignAdmin(campaignId, sender)) revert("UNAUTHORIZED");
    }

    function _isCampaignAdmin(
        uint256 campaignId,
        address _address
    ) internal view returns (bool) {
        bytes32 ADMIN_ROLE = keccak256(abi.encodePacked(campaignId, "admin"));
        return hasRole(ADMIN_ROLE, _address);
    }
}
