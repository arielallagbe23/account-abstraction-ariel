# Compte‑rendu — ce que j’ai fait

## 1) Analyse (Part 1)
- Réponses rédigées dans `Part1.md`.
- Comparaison EOA vs smart accounts + rôle de l’EntryPoint v0.7.

## 2) Implémentation (Part 2)
- Création d’un smart account multi‑owner (1‑of‑N) avec :
  - exécution simple + batching,
  - session keys (durée + nombre d’utilisations),
  - social recovery (guardian add owner),
  - compatibilité EntryPoint v0.7.
- Factory CREATE2 + proxy pour adresse counterfactuale.
- Paymaster “blind” (valide tout) pour le sponsoring.
- NFT de test pour les scénarios.

## 3) Déploiement (Part 3)
- Déploiement sur Sepolia (EntryPoint v0.7).
- Adresses déployées :
  - Factory: `0x771485f12Ac1C0D8e08177771279c133cfCa93b3`
  - Paymaster: `0xDED7a208bbce41A66dDb66b82Fa267c83eB5Cf5B`
  - DummyNFT: `0x353a0b9A3A0979fb756BdB1051e31305d7911A03`
- Deposit paymaster effectué :
  - `0xefc6bf39821b7cb288464f24397a79a73ec73f63f4c7e4db8a076f4c9ec4a359`

## 4) Démos fonctionnelles via front (UserOps)
Smart account (counterfactual + déployée) :
- `0xC67a8408A1F2c79d2196D0200Be7888F79651c81`

Scénarios validés (tx confirmées) :
- Create Account via UserOp : `0x95f6f34c48b1df80b5d2150b6a40e16f7874c27b6583bcc4e8bfb25eeeb530b5`
- Mint via Owner1 : `0x0cd35df6d9ea0a3423eb01da80a7747f3785ada50167e8efa71e5cc854087b1f`
- Mint via Owner2 : `0x487b3882df6621700d3d95adf052b2e5605b03bbe5e9d2ab80d3902ceb507dce`
- Batch mint : `0x051ab4ef06d42a21ac4aecac043a577e1eb19d204e67f5f2e66bc2801f1443d0`
- Grant session key : `0xd685819b1cce583b6a6da1befe4d14750d35684b6809888c85d08f420eb2f049`
- Mint via session key : `0xeeabd52695edb68b492319bf61a4272c119d685ce6b9e6ce7fb967454c17ec82`
- Social recovery (guardian add owner) : `0x2c0f3e9ff36ddccf7674d6630c4ad6cbafd4faaaf208004eabb155a4422b9b26`

## 5) Liens Etherscan (Sepolia)
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

## 6) Remarques
- Front volontairement minimal (HTML/JS) pour exécuter les scénarios demandés.
- Tout est exécuté via EntryPoint v0.7 sur Sepolia.
