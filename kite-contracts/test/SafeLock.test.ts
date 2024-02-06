import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("SafeLock Strategy", function () {
  let kite: Contract;
  let safeLock: Contract;
  let token: Contract;
  let owner: any, addr1: any;
  let myPool: any;
  before(async function () {
    // Assuming Kite contract is already deployed and its address is known
    const kiteAddress = ethers.getAddress(
      "0xc4a1D0485C0C7e465c56aE8d951bdCd861f40Cd5"
    );
    const strategyAddress = ethers.getAddress(
      "0xfFbB148591467a7d154fba6157F3602F01C81eEa"
    );
    const Kite = await ethers.getContractFactory("Kite");
    kite = Kite.attach(kiteAddress) as Contract;

    // Deploy a mock ERC20 token for testing
    const Token = await ethers.getContractFactory("TestERC20");
    token = (await Token.deploy()) as any;

    // Deploy a SafeLock pool
    // The create function deploys a new SafeLock instance for user
    const createTx = await kite.create(strategyAddress, [token.target]);
    await createTx.wait();
    //get pool address by strategy
    const pools = (await kite.getPoolsByStrategies(strategyAddress)) as any;
    //current pool index
    myPool = pools[pools.length - 1];
    [owner, addr1] = await ethers.getSigners();
  });

  it("Should allow user's opt-in savings for a token", async function () {
    const lockPeriod = 60 * 60 * 24; // 1 day in seconds
    await kite.optIn(myPool, token.target, lockPeriod);

    const _pool = await ethers.getContractFactory("SafeLock");
    const poolContract = _pool.attach(myPool) as Contract;
    const [isActive] = await poolContract.getTokenDetails(token.target);
    console.log(isActive);
    expect(isActive).to.be.true;
  });

});
