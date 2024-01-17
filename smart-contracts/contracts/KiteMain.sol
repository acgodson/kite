// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";

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
        uint256 maxDuration;
    }

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
        uint256 _maxDuration
    ) external {
        require(_interestRate > 0, "Interest rate must be greater than 0");
        require(_maxDuration > 0, "Max duration must be greater than 0");

        campaignIdCounter++;

        campaigns[campaignIdCounter] = Campaign({
            campaignId: campaignIdCounter,
            vaultAddress: _vaultAddress,
            interestRate: _interestRate,
            paymentInterval: _paymentInterval,
            maxDuration: _maxDuration
        });

        campaignIdsByAddress[msg.sender].push(campaignIdCounter);

        bytes32 ADMIN_ROLE = keccak256(
            abi.encodePacked(campaignIdCounter, "admin")
        );

        // Grant admin roles to the campain creator
        _grantRole(ADMIN_ROLE, msg.sender);

        emit CampaignCreated(campaignIdCounter, msg.sender);
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
        bytes32 ADMIN_ROLE = keccak256(
            abi.encodePacked(campaignId, "admin")
        );
        return hasRole(ADMIN_ROLE, _address);
    }
}
