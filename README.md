# Account Abstraction — Ariel (Foundry + Simple Front)

This repo implements a minimal ERC-4337 (EntryPoint v0.7) wallet with:
- Multi-owner (1-of-N)
- Batch execution
- Session keys
- Social recovery (guardian adds owner)
- Blind paymaster
- Simple frontend for testing

## Structure
- `src/` Solidity contracts
- `script/` Foundry scripts
- `frontend/` simple HTML/JS demo
- `Part1.md` analysis answers

## Prerequisites
- Foundry installed
- Sepolia RPC URL
- Sepolia ETH for deployer and paymaster deposit

## Install dependencies
```bash
forge install eth-infinitism/account-abstraction@releases/v0.7
forge install OpenZeppelin/openzeppelin-contracts
```

## .env
Create a `.env` in the repo root:
```ini
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_deployer_private_key_no_0x
ENTRYPOINT_ADDRESS=0x0000000071727De22E5E9d8BAf0edAc6f37da032
```

## Deploy contracts
```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

## Fund Paymaster deposit
```bash
PAYMASTER_ADDRESS=0x... 
PAYMASTER_DEPOSIT_WEI=50000000000000000 # 0.05 ETH
forge script script/FundPaymaster.s.sol:FundPaymasterScript --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY --broadcast
```

## Frontend setup
Edit `frontend/config.js` with your values, then open `frontend/index.html` in a browser.

The UI lets you:
- Show predicted account address (before deployment)
- Deploy via UserOperation
- Mint a dummy NFT
- Grant/use session key
- Social recovery (guardian adds owner)

## Notes
- EntryPoint v0.7 required by the assignment
- The paymaster is intentionally permissive for demo purposes
