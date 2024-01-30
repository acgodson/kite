// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

import "../helpers/IStrategy.sol";
import "../helpers/VaultHelpers.sol";

// Initializable,
contract KiteVault is IStrategy, ERC4626, Initializable, VaultHelpers {
    //address of  Kite Core
    address constant _KITECORE =
        address(0x66EC7F74D59214560DE1b0CaD2527d2b2a998FC4);

    //address of Vault Asset
    address constant _ASSET =
        address(0x66EC7F74D59214560DE1b0CaD2527d2b2a998FC4);

    bool public isActive;
    uint256 public unlockTimestamp;
    address[] public liquidityProviders;

    // Shares of  Depositor in kiteUSDC
    mapping(address => uint256) public shares;

    // Event emitted when a trade is executed
    event TradeExecuted(
        uint256 campaignID,
        uint256 tradeId,
        uint256 totalShares,
        uint256 lastInterval
    );

    constructor() ERC4626(ERC20(_ASSET)) ERC20("Kite Shares", "kiteUSDC") {}

    modifier onlyCore() {
        require(msg.sender == _KITECORE, "Caller is not the core address");
        _;
    }

    function initialize(address[] memory _whitelist) external onlyCore {
        require(
            _whitelist.length < 2,
            "Only one asset is allowed in the  vault"
        );
        //verify token is same as vault asset
        require(
            _whitelist[0] == _ASSET,
            "Token is different from vault's asset"
        );
    }

    // Opt in a token for a savings period
    function optIn(address token, uint256 _lockPeriod) external onlyCore {
        require(_isWhiteListed(token), "Wrong Token");
        require(!isActive, "Token is aleady active");
        isActive = true;
        unlockTimestamp = block.timestamp + _lockPeriod;
    }

    // Deposit tokens into vault
    function deposit(
        address token,
        uint256 amount,
        address sender
    ) external onlyCore {
        require(_isWhiteListed(token), "Wrong Token");
        require(isActive, "Token drips paused");
        require(
            IERC20(token).transferFrom(sender, address(this), amount),
            "Transfer failed"
        );
        // Record the deposit
        shares[sender] += amount;
        liquidityProviders.push(sender);

        //Kite gives shareholder allowance to spend shares
    }

    // Withdraw amount through kite
    function withdraw(
        address token,
        address receiver,
        uint256 amount
    ) external {
        uint256 depositorShare = shares[msg.sender];
        uint256 totalShares = totalSupply();

        require(amount > 0, "Invalid amount");
        //liquidity shareholder/provider can withdraw
        require(depositorShare <= amount, "Invalid Shares");
        //withdrawal allowed only at eligible time
        require(unlockTimestamp < block.timestamp, "Lock period is not over");

        // Calculate the proportion of shares to withdraw for the current depositor
        uint256 sharesToWithdraw = (amount * depositorShare) / totalShares;

        uint256 _shares = previewWithdraw(sharesToWithdraw);

        // Transfer the corresponding amount of assets to the receiver
        _withdraw(msg.sender, receiver, msg.sender, amount, _shares);

        //update user's share
        shares[msg.sender] -= amount;
    }

    function whitelist(address token) external {
        revert("Can't update vault whitelist");
    }

    function getTokenDetails(
        address token
    ) external view returns (bool, uint256) {
        return (isActive, unlockTimestamp);
    }

    function getShareholders(
        address token
    ) external returns (address[] memory, uint256[] memory) {
        address[] memory holders = new address[](liquidityProviders.length);
        uint256[] memory sharesArray = new uint256[](liquidityProviders.length);

        for (uint256 i = 0; i < liquidityProviders.length; i++) {
            address holder = liquidityProviders[i];
            uint256 _share = shares[holder]; // Corrected this line

            sharesArray[i] = _share;
            holders[i] = holder;
        }
        return (holders, sharesArray);
    }

    function isWhiteListed(address token) external view returns (bool) {
        return _isWhiteListed(token);
    }

    function _isWhiteListed(address token) internal view returns (bool) {
        if (_ASSET == token) {
            return true;
        }
        return false;
    }
}
