# 🪁 Kite Finance x Wallet Extension

Building an Automatable Savings Account on Lightlink

The Kite is a central hub for managing different savings strategies and pools. It allows users to create savings pools based on predefined strategies, opt into these pools with specific tokens, and manage deposits automatically.

## Key Features:
- Strategy Management: Users can create savings pools based on these strategies.
- Savings Pools: Users can opt into these pools with specific tokens, specifying a lock period or condition for their savings.
- Deposits and Withdrawals: Kite supports depositing tokens into pools and handling withdrawals, including calculating and performing token remittances based on specific conditions.

###  SafeLock Contract

The SafeLock contract is an example of a specific savings strategy that can be used with the Kite contract. It implements the IStrategy interface and focuses on locking tokens for a specified period, acting as a "safe" where tokens can be deposited and locked.

