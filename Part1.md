# Part 1 — Analysis

## 1) EOAs vs Smart Contract Accounts (security implications)

**EOAs (Externally Owned Accounts)**
- **Pros:** Simple model; fewer moving parts; no custom code risk.
- **Cons:** Single private key = single point of failure; limited recovery; no native policy controls (rate limits, 2FA, session keys, etc.); phishing or key theft leads to full loss.
- **Security model:** Relies entirely on off-chain key management.

**Smart Contract Accounts**
- **Pros:** Programmable security (multi-owner, multisig, session keys, spending limits, social recovery, guardians, time locks); gas abstraction possible via paymasters; flexible upgrade paths.
- **Cons:** Code risk (bugs in wallet logic), upgrade governance risk, dependency on EntryPoint & bundlers, more complex attack surface (replay, signature handling, session constraints, paymaster abuse).
- **Security model:** Split between on-chain logic + off-chain keys + system infrastructure.

**Conclusion:** EOAs are simpler but brittle; smart accounts are more resilient and feature-rich if implemented carefully, but require strong audits and secure governance to avoid introducing vulnerabilities.

## 2) Role of EntryPoint in ERC-4337

EntryPoint is the central contract that **validates and executes UserOperations**. It:
- Verifies signatures by calling the account’s `validateUserOp` logic.
- Handles nonces, gas accounting, and refunds.
- Executes the actual call(s) to the smart account.
- Interacts with paymasters (for gas sponsorship) and checks their validation logic.
- Serves as the “dispatcher” so accounts don’t need direct EOA transactions.

In ERC‑4337, EntryPoint is required to standardize the execution flow and keep accounts compatible with bundlers and paymasters.
