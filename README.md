# Account Abstraction TD

## Résumé exécutif
- Implémentation complète ERC‑4337 (EntryPoint v0.7) : factory, smart account multi‑owner, session keys, social recovery, paymaster permissif.
- Déploiement Sepolia + démonstrations fonctionnelles validées (UserOps, session key, recovery).
- Front minimal (HTML/JS) pour exécuter les scénarios demandés.

## 1) Analyse (Part 1)
Voir `Part1.md` pour les réponses détaillées :
- Comparaison sécurité EOA vs Smart Accounts
- Rôle de l’EntryPoint dans ERC‑4337

## 2) Implémentation (Part 2)
Contrats (EntryPoint v0.7) :
- `src/MultiOwnerAccount.sol` : multi‑owner, batching, session keys, social recovery
- `src/MultiOwnerAccountFactory.sol` : factory + CREATE2 + proxy
- `src/BlindPaymaster.sol` : paymaster permissif
- `src/DummyNFT.sol` : NFT de test

## 3) Déploiement (Part 3)
Réseau : Sepolia (chainId 11155111)
EntryPoint v0.7 : `0x0000000071727De22E5E9d8BAf0edAc6f37da032`

### Contrats déployés
- Factory: `0x771485f12Ac1C0D8e08177771279c133cfCa93b3`
- Paymaster: `0xDED7a208bbce41A66dDb66b82Fa267c83eB5Cf5B`
- DummyNFT: `0x353a0b9A3A0979fb756BdB1051e31305d7911A03`

### Transactions de déploiement
- Factory deploy tx: `0x1a308facaa7f49dfd2167786c4bc05880e07c1e7f9c714cd3fd1b02f80248e87`
- Paymaster deploy tx: `0x5ff2f570eba87738091174e64628cc74a1f40b857e4acdc18f69877ddc22b554`
- DummyNFT deploy tx: `0x6912df61484dda683c3089eb7abda180258aaf797613034e9709576cb4e29cc8`

### Paymaster deposit
- Deposit tx: `0xefc6bf39821b7cb288464f24397a79a73ec73f63f4c7e4db8a076f4c9ec4a359`

## 4) Demos fonctionnelles (front minimal)
Adresse du smart account (counterfactual + déployée) :
- `0xC67a8408A1F2c79d2196D0200Be7888F79651c81`

### 4.1 Create Account via UserOp
- UserOp confirmé (tx): `0x95f6f34c48b1df80b5d2150b6a40e16f7874c27b6583bcc4e8bfb25eeeb530b5`

### 4.2 Mint NFT via Owner1 (UserOp)
- Mint confirmé (tx): `0x0cd35df6d9ea0a3423eb01da80a7747f3785ada50167e8efa71e5cc854087b1f`

### 4.3 Mint NFT via Owner2 (UserOp)
- Mint confirmé (tx): `0x487b3882df6621700d3d95adf052b2e5605b03bbe5e9d2ab80d3902ceb507dce`

### 4.4 Session Key
- Grant session key (UserOp) confirmé (tx): `0xd685819b1cce583b6a6da1befe4d14750d35684b6809888c85d08f420eb2f049`
- Mint via session key (UserOp) confirmé (tx): `0xeeabd52695edb68b492319bf61a4272c119d685ce6b9e6ce7fb967454c17ec82`

### 4.5 Batch Execution (UserOp)
- Batch mint (UserOp) confirmé (tx): `0x051ab4ef06d42a21ac4aecac043a577e1eb19d204e67f5f2e66bc2801f1443d0`

### 4.6 Social Recovery (guardian)
- Guardian Add Owner confirmé (tx): `0x2c0f3e9ff36ddccf7674d6630c4ad6cbafd4faaaf208004eabb155a4422b9b26`

## 5) Liens Etherscan (Sepolia)
Copier/coller dans un navigateur :
```
https://sepolia.etherscan.io/address/0x771485f12Ac1C0D8e08177771279c133cfCa93b3
https://sepolia.etherscan.io/address/0xDED7a208bbce41A66dDb66b82Fa267c83eB5Cf5B
https://sepolia.etherscan.io/address/0x353a0b9A3A0979fb756BdB1051e31305d7911A03
https://sepolia.etherscan.io/address/0xC67a8408A1F2c79d2196D0200Be7888F79651c81

https://sepolia.etherscan.io/tx/0x1a308facaa7f49dfd2167786c4bc05880e07c1e7f9c714cd3fd1b02f80248e87
https://sepolia.etherscan.io/tx/0x5ff2f570eba87738091174e64628cc74a1f40b857e4acdc18f69877ddc22b554
https://sepolia.etherscan.io/tx/0x6912df61484dda683c3089eb7abda180258aaf797613034e9709576cb4e29cc8
https://sepolia.etherscan.io/tx/0xefc6bf39821b7cb288464f24397a79a73ec73f63f4c7e4db8a076f4c9ec4a359
https://sepolia.etherscan.io/tx/0x95f6f34c48b1df80b5d2150b6a40e16f7874c27b6583bcc4e8bfb25eeeb530b5
https://sepolia.etherscan.io/tx/0x0cd35df6d9ea0a3423eb01da80a7747f3785ada50167e8efa71e5cc854087b1f
https://sepolia.etherscan.io/tx/0x487b3882df6621700d3d95adf052b2e5605b03bbe5e9d2ab80d3902ceb507dce
https://sepolia.etherscan.io/tx/0x051ab4ef06d42a21ac4aecac043a577e1eb19d204e67f5f2e66bc2801f1443d0
https://sepolia.etherscan.io/tx/0xd685819b1cce583b6a6da1befe4d14750d35684b6809888c85d08f420eb2f049
https://sepolia.etherscan.io/tx/0xeeabd52695edb68b492319bf61a4272c119d685ce6b9e6ce7fb967454c17ec82
https://sepolia.etherscan.io/tx/0x2c0f3e9ff36ddccf7674d6630c4ad6cbafd4faaaf208004eabb155a4422b9b26
```

## 6) Logs clés
```
[15:15:14] Confirmed: 0x95f6f34c48b1df80b5d2150b6a40e16f7874c27b6583bcc4e8bfb25eeeb530b5
[15:18:35] Paymaster deposit tx: 0xefc6bf39821b7cb288464f24397a79a73ec73f63f4c7e4db8a076f4c9ec4a359
[15:24:50] Confirmed: 0x0cd35df6d9ea0a3423eb01da80a7747f3785ada50167e8efa71e5cc854087b1f
[15:26:04] Confirmed: 0x487b3882df6621700d3d95adf052b2e5605b03bbe5e9d2ab80d3902ceb507dce
[15:30:50] Confirmed: 0x051ab4ef06d42a21ac4aecac043a577e1eb19d204e67f5f2e66bc2801f1443d0
[16:02:16] Confirmed: 0xd685819b1cce583b6a6da1befe4d14750d35684b6809888c85d08f420eb2f049
[16:03:01] Confirmed: 0xeeabd52695edb68b492319bf61a4272c119d685ce6b9e6ce7fb967454c17ec82
[16:05:30] Guardian tx: 0x2c0f3e9ff36ddccf7674d6630c4ad6cbafd4faaaf208004eabb155a4422b9b26
```

## 7) Remarques
- Le front est volontairement minimal (HTML/JS) et utilise un bundler (Pimlico).
- Toutes les fonctionnalités demandées dans l’énoncé ont été démontrées sur Sepolia.
