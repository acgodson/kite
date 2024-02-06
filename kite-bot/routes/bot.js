var express = require("express");
const ethers = require("ethers");
var router = express.Router();
const { kiteABI, ERC20_ABI } = require("../abi.js");

/**
 * @dev This is a demo contract representing the Kite bot for testing Kite strategy upkeep.
 * It uses a single user's address and a specific token as a test case.
 */
router.get("/", async function (req, res, next) {
  const contractAbi = kiteABI;
  //kite Contract Address
  const contractAddress = "0xD6b804951f7FBeA42587b6b66c4302f186554837";
  //address of account with active savings stragegy/NFT holder
  const userAddr = "";
  // user/bot/upkeeper's private key - connect with Kite contract on enterprise mode account to make txn gasless
  const privateKey = "";
  // pegasus testnet
  const chain = "https://replicator.pegasus.lightlink.io/rpc/v1";

  const provider = new ethers.JsonRpcProvider(chain);
  const wallet = new ethers.Wallet(privateKey, provider);
  const kiteContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    wallet
  );

  // Function to check upkeep and perform upkeep if needed
  const checkAndPerformUpkeep = async (token) => {
    try {
      const upkeepNeeded = await kiteContract.checkUpkeep(token); //assumes msg.sender is pool owner
      // const upkeepNeeded = await kiteContract.checkUpkeep(token, userAddr); //third party monitor

      if (upkeepNeeded) {
        console.log(`Upkeep is needed for ${userAddr}`);
        // return
        // On frontend Txn would revert if Spending  cap is reached
        const pool = await kiteContract.getPoolByToken(token);
        const tokenContract = new ethers.Contract(token, ERC20_ABI, wallet);
        const amountInWei = ethers.parseEther("100");
        const approvalTxResponse = await tokenContract.approve(
          pool,
          amountInWei
        );
        approvalTxResponse.wait();
        if (approvalTxResponse) {
          console.log("in progress...");
          await kiteContract.performUpKeep(token);
          console.log(`Upkeep performed for ${userAddr} on token ${token}`);
        }
      } else {
        console.log(false);
        // res.status(200).json({ data: `No Upkeep is needed for ${userAddr}` });
      }
    } catch (error) {
      console.error("Error checking/upkeeping:", error);
    }
  };

  // Replace 'address', with the actual tokens you want to monitor
  setInterval(async () => {
    await checkAndPerformUpkeep("0x3b70652cB79780cA1bf60a8b34cc589BbeDc00B2"); //assumes msg.sender is pool owner
    // version 2
    // await checkAndPerformUpkeep("0x3b70652cB79780cA1bf60a8b34cc589BbeDc00B2", userAddr ); //third party monitor
  }, 20000); // Repeat every 20 seconds (adjust as needed)
});

module.exports = router;
