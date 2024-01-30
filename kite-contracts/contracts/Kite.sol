// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./helpers/IStrategy.sol";

// 0x3b70652cB79780cA1bf60a8b34cc589BbeDc00B2

contract Kite is AccessControl {
    uint256 private constant DECIMALS = 18;
    uint256 public clonesCounter;

    // SafeLock, Flexi, Target, yield etc; 0x5448F14F54f9EBc6E1f3ed96781046500ffCb302
    address[] public kiteStrategies;

    //Set kite Strategy
    mapping(address => bool) public isKiteStrategy;

    //Set Cloned Strategy
    mapping(address => bool) public isClonedStrategy;

    // Users pools by kite strategies {userAddress => kiteStrategyHash => pools[]}
    mapping(address => mapping(bytes32 => address[])) public poolsbyStrategies;

    // Users pools by tokens {userAddress => (tokenAddress => poolAddress)}
    mapping(address => mapping(address => address)) public poolbyTokens;

    // Event emitted when a user opts in to the strategyƒ
    event OptIn(address indexed user, address token, address indexed strategy);

    //  Emit Event when a user deposits tokens
    event Deposit(
        address indexed pool,
        address indexed token,
        address indexed provider,
        uint256 amount
    );

    event LogValues(
        string action,
        uint256 userBalance,
        uint256 roundedBalance,
        uint256 amount
    );


    modifier onlyAdmin(address pool, address sender) {
        _checkOnlyAdmin(pool, sender);
        _;
    }

    // Create a Savings Pool
    function create(address kiteStrategy, address[] memory tokens) external {
        require(_isKiteStrategy(kiteStrategy), "Invalid strategy");

        bytes32 kiteStrategyHash = keccak256(abi.encodePacked(kiteStrategy));

        // Clone  strategy for the user
        address pool = _cloneStrategy(kiteStrategy);
        isClonedStrategy[pool] = true;

        require(pool != address(0), "invalid pool");

        //Whitelist tokens
        IStrategy(pool).initialize(tokens); 

        // // record the user's new strategy
        poolsbyStrategies[msg.sender][kiteStrategyHash].push(pool);

        bytes32 Admin_ROLE = keccak256(abi.encodePacked(pool, "admin"));
        _grantRole(Admin_ROLE, msg.sender);
    }

    // Optin tokens to a Savings Pool
    function optIn(
        address pool,
        address token,
        uint256 lockPeriod
    ) external onlyAdmin(pool, msg.sender) {
        require(
            _isClonedStrategy(pool),
            "pool does not implement a kite strategy"
        );

        // Check that token is permitted in pool
        require(
            IStrategy(pool).isWhiteListed(token),
            "token is not allowed in pool"
        );

        // Check that token is not opted in for savings
        require(!_isActive(pool, token), "token already opted in");

        //opt in token
        IStrategy(pool).optIn(token, lockPeriod);

        //add pool record to users token
        poolbyTokens[msg.sender][token] = pool;

        // Emit event
        emit OptIn(msg.sender, token, pool);
    }

    // Checks if a remittance is due
    function checkUpkeep(address token)
        external
        view
        returns (bool upkeepNeeded)
    {
        address pool = poolbyTokens[msg.sender][token];

        if (pool == address(0)) {
            //return if no pool is found
            return false;
        }
        uint256 userBalance = ERC20(token).balanceOf(msg.sender);

        (bool isActive, uint256 unlockTimestamp) = IStrategy(pool)
            .getTokenDetails(token);

        upkeepNeeded =
            isActive &&
            block.timestamp < unlockTimestamp &&
            _checkIfRequiresRoundDown(userBalance);
    }

    // Perfom remittance to savings pool///
    function performUpKeep(
        address token //  ,address sender
    ) external {
        //retrieve pool
        address pool = poolbyTokens[msg.sender][token];
        require(pool != address(0), "invalid pool");

        //calculate rounddown
        uint256 amount = _roundDownERC20Balance(token, msg.sender);
        require(amount > 0, "invalid deposit amount");

        //deposit into pool
        IStrategy(pool).deposit(token, amount, msg.sender);

        emit Deposit(pool, token, msg.sender, amount);
    }

    // filter user's pools by the Kite strategies they implement
    function getPoolsByStrategies(address kiteStrategy)
        external
        view
        returns (address[] memory)
    {
        bytes32 kiteStrategyHash = keccak256(abi.encodePacked(kiteStrategy));
        return poolsbyStrategies[msg.sender][kiteStrategyHash];
    }

    // Get token's  active savings pool
    function getPoolByToken(address token) external view returns (address) {
        return poolbyTokens[msg.sender][token];
    }

    // Add a new Kite Strategy to contract
    function setKiteStrategy(address strategy) external {
        require(!_isKiteStrategy(strategy), "Already a Kite Strategy");
        isKiteStrategy[strategy] = true;
        kiteStrategies.push(strategy);
    }

    function _cloneStrategy(address strategy) internal returns (address) {
        uint256 nonce = ++clonesCounter;
        address clone = Clones.cloneDeterministic(
            strategy,
          keccak256(abi.encodePacked(address(this), nonce))
        );
        return clone;
    }

    function _isKiteStrategy(address strategy) internal view returns (bool) {
        return isKiteStrategy[strategy];
    }

    function _isClonedStrategy(address strategy) internal view returns (bool) {
        return isClonedStrategy[strategy];
    }

    function _isActive(address pool, address token)
        internal
        view
        returns (bool)
    {
        (bool isActive, ) = IStrategy(pool).getTokenDetails(token);
        return isActive;
    }

    function _checkOnlyAdmin(address pool, address sender) internal view {
        if (!_isPoolAdmin(pool, sender)) revert("UNAUTHORIZED");
    }

    function _isPoolAdmin(address pool, address _address)
        internal
        view
        returns (bool)
    {
        bytes32 Admin_ROLE = keccak256(abi.encodePacked(pool, "admin"));
        return hasRole(Admin_ROLE, _address);
    }

    function _checkIfRequiresRoundDown(uint256 balance)
        internal
        pure
        returns (bool)
    {
        // Check if balance is not a multiple of 10 (18 decimals)
        return balance % 10**18 != 0;
    }

    // Function to round down to the nearest multiple of 10 (18 decimals)
    function _roundDownToNearestMultiple(uint256 balance)
        internal
        pure
        returns (uint256)
    {
        // Calculate the appropriate base //hardcoded
        // uint256 base = balance < 100 ? 10 : balance < 99999 ? 10000 : 100;
        uint256 base = balance > 99999 ? 10000 : (balance < 100 ? 10 : 100);

        // Round down to the nearest multiple of the base
        return (balance / base) * base;
    }

    function _roundDownERC20Balance(address token, address sender)
        internal
        view
        returns (uint256 remainder)
    {
        // Get ERC20 token contract
        ERC20 erc20 = ERC20(
            address(token) //0x3b70652cB79780cA1bf60a8b34cc589BbeDc00B2
        );

        // Get the balance of the sender in the ERC20 token
        uint256 balance = erc20.balanceOf(sender);

        // Convert the balance to a number (remove the 18 decimals)
        uint256 balanceAsNumber = balance / 10**erc20.decimals();

        // Check again if rounding down is required
        bool requiresRoundDown = _checkIfRequiresRoundDown(balanceAsNumber);

        require(requiresRoundDown, "Not eligible for round down");

        // Round down if required
        uint256 roundedBalanceAsNumber = _roundDownToNearestMultiple(
            balanceAsNumber
        );

        // Convert the rounded balance back to a uint256 with 18 decimals
        uint256 roundedBalance = roundedBalanceAsNumber * 10**18;

        //Calculate remainder
        remainder = balance - roundedBalance;

        return remainder;
    }
}
