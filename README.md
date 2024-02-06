# 🪁 Kite Finance x Wallet

Building an Automatable Savings Account on Lightlink - [Video 🎥 ](https://vimeo.com/909847825)

The Kite is a central hub for managing different savings strategies and pools. It allows users to create savings pools based on predefined strategies, opt into these pools with specific tokens, and manage deposits automatically.

*Built on/with*
- Lightlink Pegasus testnet, enterprise mode
- Pegasus/Blockscout API
- Solidity and hardhat typescript
- React Typescript & Ethers.js frontend

## Key Features:

- Strategy Management: Users can create savings pools based on these strategies.
- Savings Pools: Users can opt into these pools with specific tokens, specifying a lock period or condition for their savings.
- Deposits and Withdrawals: Kite supports depositing tokens into pools and handling withdrawals, including calculating and performing token remittances based on specific conditions.

## [Kite Strategies](https://github.com/acgodson/kite/tree/main/kite-contracts/contracts/strategies)

**SafeLock Example**

The SafeLock contract is an example of a specific savings strategy that can be used with the Kite contract. It implements the IStrategy interface and focuses on locking tokens for a specified period, acting as a "safe" where tokens can be deposited and locked.

[Typescript Test](kite-contracts/test/SafeLock.ts)

Configure default hardhat network to test on pegasus `https://replicator.pegasus.lightlink.io/rpc/v1 `

```
cd kite-contracts
npx hardhat test
```

### Performing Upkeeps

- [CheckUpkeep]() view function is used to check if a remittance is due for a specific token based on when the user's balance is not a whole number, multiple of 10
- [performUpKeep]() executes the actual remittance process by depositing the required amount into the savings pool
- [Kite bot]() demonstrates how we can setup an upkeeper for performing gasless upkeeps. The bot account and Kite contract is registered on Lighthouse enterprise mode.

[Typescript Test]()

### Kite Wallet Extension

- Kite [Wallet] is a browser,non-custodial extension wallet that extends to the Kite Protocol. Users can create private key accounts, perform transactions and opt in tokens to savings pools cloned from kite strategies

  - [video Demo](https://vimeo.com/909847825)

  #### Installation

  - `Extract Zip folder`
  - `Load Extension on Chrome`
  - `Create or Import wallet`

  ### Lightlink Upkeep Test

  ```
  cd kite-bot
  npm start
  //  dev url http://localhost:4040/
  ```

### Contributors

| [@acgodson]() | Contracts & Wallet |
| ------------- | ------------------ |
| [@Blossom]()  | Design             |


Ping us 👋  if you'd like to contribute on kite and more strategy implementations ahead of mainnet.

