import {
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  toHex
} from "https://esm.sh/viem@1.21.4";
import { privateKeyToAccount } from "https://esm.sh/viem@1.21.4/accounts";
import { sepolia } from "https://esm.sh/viem@1.21.4/chains";

const cfg = window.CONFIG;

const elAccount = document.getElementById("accountAddress");
const elDeployed = document.getElementById("deploymentStatus");
const elLogs = document.getElementById("logs");

const btnPredict = document.getElementById("btnPredict");
const btnDeploy = document.getElementById("btnDeploy");
const btnFundPaymaster = document.getElementById("btnFundPaymaster");
const btnMintOwner1 = document.getElementById("btnMintOwner1");
const btnMintOwner2 = document.getElementById("btnMintOwner2");
const btnBatchMint = document.getElementById("btnBatchMint");
const btnGrantSession = document.getElementById("btnGrantSession");
const btnUseSession = document.getElementById("btnUseSession");
const btnRecover = document.getElementById("btnRecover");
const inputNewOwner = document.getElementById("newOwner");

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(cfg.SEPOLIA_RPC_URL)
});
const walletClient = createWalletClient({
  chain: sepolia,
  transport: http(cfg.SEPOLIA_RPC_URL)
});

const owner1 = privateKeyToAccount(`0x${cfg.OWNER1_PRIVATE_KEY}`);
const owner2 = privateKeyToAccount(`0x${cfg.OWNER2_PRIVATE_KEY}`);
const sessionKey = privateKeyToAccount(`0x${cfg.SESSION_KEY_PRIVATE_KEY}`);
const guardian = privateKeyToAccount(`0x${cfg.GUARDIAN_PRIVATE_KEY}`);

const FactoryAbi = [
  {
    name: "getAddress",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "guardian", type: "address" },
      { name: "salt", type: "uint256" }
    ],
    outputs: [{ name: "", type: "address" }]
  },
  {
    name: "createAccount",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "owners", type: "address[]" },
      { name: "guardian", type: "address" },
      { name: "salt", type: "uint256" }
    ],
    outputs: [{ name: "", type: "address" }]
  }
];

const AccountAbi = [
  {
    name: "execute",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dest", type: "address" },
      { name: "value", type: "uint256" },
      { name: "func", type: "bytes" }
    ],
    outputs: []
  },
  {
    name: "executeBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "dest", type: "address[]" },
      { name: "value", type: "uint256[]" },
      { name: "func", type: "bytes[]" }
    ],
    outputs: []
  },
  {
    name: "sessionKeys",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "key", type: "address" }],
    outputs: [
      { name: "validUntil", type: "uint64" },
      { name: "usesRemaining", type: "uint32" }
    ]
  },
  {
    name: "grantSessionKey",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "key", type: "address" },
      { name: "validUntil", type: "uint64" },
      { name: "usesRemaining", type: "uint32" }
    ],
    outputs: []
  },
  {
    name: "guardianAddOwner",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "newOwner", type: "address" }],
    outputs: []
  },
  {
    name: "noop",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  }
];

const DummyNftAbi = [
  {
    name: "safeMint",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "to", type: "address" }],
    outputs: []
  }
];

const EntryPointAbi = [
  {
    name: "getNonce",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "sender", type: "address" },
      { name: "key", type: "uint192" }
    ],
    outputs: [{ name: "nonce", type: "uint256" }]
  },
  {
    name: "getUserOpHash",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "userOp",
        type: "tuple",
        components: [
          { name: "sender", type: "address" },
          { name: "nonce", type: "uint256" },
          { name: "initCode", type: "bytes" },
          { name: "callData", type: "bytes" },
          { name: "accountGasLimits", type: "bytes32" },
          { name: "preVerificationGas", type: "uint256" },
          { name: "gasFees", type: "bytes32" },
          { name: "paymasterAndData", type: "bytes" },
          { name: "signature", type: "bytes" }
        ]
      }
    ],
    outputs: [{ name: "userOpHash", type: "bytes32" }]
  }
];

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  elLogs.textContent += `${line}\n`;
  elLogs.scrollTop = elLogs.scrollHeight;
}

async function readSessionKey(accountAddress) {
  const data = await publicClient.readContract({
    address: accountAddress,
    abi: AccountAbi,
    functionName: "sessionKeys",
    args: [sessionKey.address]
  });
  const validUntil = Number(data[0]);
  const usesRemaining = Number(data[1]);
  log(`SessionKey status: validUntil=${validUntil}, usesRemaining=${usesRemaining}`);
}

function packHighLow128(high, low) {
  const h = BigInt(high) & ((1n << 128n) - 1n);
  const l = BigInt(low) & ((1n << 128n) - 1n);
  return toHex((h << 128n) | l, { size: 32 });
}

async function predictAddress() {
  const addr = await publicClient.readContract({
    address: cfg.FACTORY_ADDRESS,
    abi: FactoryAbi,
    functionName: "getAddress",
    args: [[owner1.address, owner2.address], cfg.GUARDIAN_ADDRESS, BigInt(cfg.ACCOUNT_SALT)]
  });
  elAccount.textContent = addr;
  await checkDeployment(addr);
  return addr;
}

async function checkDeployment(addr) {
  const code = await publicClient.getBytecode({ address: addr });
  const deployed = code && code !== "0x";
  elDeployed.textContent = deployed ? "yes" : "no";
  return deployed;
}

async function fetchPimlicoGas() {
  const resp = await fetch(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${cfg.PIMLICO_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "pimlico_getUserOperationGasPrice",
      params: []
    })
  });
  const json = await resp.json();
  if (json.error) throw new Error(json.error.message);
  const tier = json.result.fast || json.result.standard || json.result;
  return {
    maxPriorityFeePerGas: BigInt(tier.maxPriorityFeePerGas),
    maxFeePerGas: BigInt(tier.maxFeePerGas)
  };
}

async function sendUserOperation(senderAccount, callData) {
  const accountAddress = await predictAddress();
  const entryPointAddress = cfg.ENTRYPOINT_ADDRESS;

  let maxPriorityFeePerGas;
  let maxFeePerGas;
  try {
    const gas = await fetchPimlicoGas();
    maxPriorityFeePerGas = gas.maxPriorityFeePerGas;
    maxFeePerGas = gas.maxFeePerGas;
  } catch (e) {
    log("Pimlico gas failed, using fallback");
    const gasPrice = await publicClient.getGasPrice();
    maxPriorityFeePerGas = gasPrice;
    maxFeePerGas = gasPrice * 2n;
  }

  const callGasLimit = 100000n;
  const verificationGasLimit = 600000n;
  const preVerificationGas = 100000n;

  const validationGas = 100000n;
  const postOpGas = 100000n;
  const pmAddr = cfg.PAYMASTER_ADDRESS.toLowerCase().replace(/^0x/, "");
  const valHex = toHex(validationGas, { size: 16 });
  const postHex = toHex(postOpGas, { size: 16 });
  const paymasterAndDataPacked = (`0x${pmAddr}${valHex.slice(2)}${postHex.slice(2)}`);

  const nonce = await publicClient.readContract({
    address: entryPointAddress,
    abi: EntryPointAbi,
    functionName: "getNonce",
    args: [accountAddress, 0]
  });

  const packedUserOp = {
    sender: accountAddress,
    nonce,
    initCode: "0x",
    callData,
    accountGasLimits: packHighLow128(verificationGasLimit, callGasLimit),
    preVerificationGas,
    gasFees: packHighLow128(maxPriorityFeePerGas, maxFeePerGas),
    paymasterAndData: paymasterAndDataPacked,
    signature: "0x"
  };

  const code = await publicClient.getBytecode({ address: accountAddress });
  let needsFactory = false;
  let factoryData;

  if (!code || code === "0x") {
    const createAccountData = encodeFunctionData({
      abi: FactoryAbi,
      functionName: "createAccount",
      args: [[owner1.address, owner2.address], cfg.GUARDIAN_ADDRESS, BigInt(cfg.ACCOUNT_SALT)]
    });
    packedUserOp.initCode = `${cfg.FACTORY_ADDRESS}${createAccountData.slice(2)}`;
    needsFactory = true;
    factoryData = createAccountData;
  }

  const userOpHash = await publicClient.readContract({
    address: entryPointAddress,
    abi: EntryPointAbi,
    functionName: "getUserOpHash",
    args: [packedUserOp]
  });
  const signature = await senderAccount.signMessage({ message: { raw: userOpHash } });
  packedUserOp.signature = signature;

  const userOpForSend = {
    sender: packedUserOp.sender,
    nonce: toHex(nonce),
    callData: packedUserOp.callData,
    callGasLimit: toHex(callGasLimit),
    verificationGasLimit: toHex(verificationGasLimit),
    preVerificationGas: toHex(preVerificationGas),
    maxFeePerGas: toHex(maxFeePerGas),
    maxPriorityFeePerGas: toHex(maxPriorityFeePerGas),
    signature: packedUserOp.signature,
    paymaster: cfg.PAYMASTER_ADDRESS,
    paymasterVerificationGasLimit: toHex(validationGas),
    paymasterPostOpGasLimit: toHex(postOpGas),
    paymasterData: "0x"
  };

  if (needsFactory) {
    userOpForSend.factory = cfg.FACTORY_ADDRESS;
    userOpForSend.factoryData = factoryData;
  }

  const resp = await fetch(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${cfg.PIMLICO_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_sendUserOperation",
      params: [userOpForSend, cfg.ENTRYPOINT_ADDRESS]
    })
  });
  const json = await resp.json();
  if (json.error) throw new Error(json.error.message);

  const userOpHash2 = json.result;
  log(`UserOp sent: ${userOpHash2}`);

  let receipt = null;
  for (let i = 0; i < 45; i++) {
    await new Promise(r => setTimeout(r, 1000));
    const receiptResp = await fetch(`https://api.pimlico.io/v2/sepolia/rpc?apikey=${cfg.PIMLICO_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getUserOperationReceipt",
        params: [userOpHash2]
      })
    });
    const receiptJson = await receiptResp.json();
    if (receiptJson.result) {
      receipt = receiptJson.result;
      break;
    }
  }

  if (receipt) {
    log(`Confirmed: ${receipt.receipt.transactionHash}`);
  } else {
    log("Timeout waiting for receipt");
  }
}

btnPredict.addEventListener("click", async () => {
  try {
    const addr = await predictAddress();
    log(`Predicted account: ${addr}`);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnDeploy.addEventListener("click", async () => {
  try {
    const callData = encodeFunctionData({
      abi: AccountAbi,
      functionName: "noop",
      args: []
    });
    await sendUserOperation(owner1, callData);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnFundPaymaster.addEventListener("click", async () => {
  try {
    const hash = await walletClient.writeContract({
      address: cfg.ENTRYPOINT_ADDRESS,
      abi: [
        {
          name: "depositTo",
          type: "function",
          stateMutability: "payable",
          inputs: [{ name: "account", type: "address" }],
          outputs: []
        }
      ],
      functionName: "depositTo",
      args: [cfg.PAYMASTER_ADDRESS],
      account: owner1,
      value: 20000000000000000n
    });
    log(`Paymaster deposit tx: ${hash}`);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnMintOwner1.addEventListener("click", async () => {
  try {
    const accountAddress = await predictAddress();
    const mintCall = encodeFunctionData({
      abi: DummyNftAbi,
      functionName: "safeMint",
      args: [accountAddress]
    });
    const callData = encodeFunctionData({
      abi: AccountAbi,
      functionName: "execute",
      args: [cfg.DUMMY_NFT_ADDRESS, 0n, mintCall]
    });
    await sendUserOperation(owner1, callData);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnMintOwner2.addEventListener("click", async () => {
  try {
    const accountAddress = await predictAddress();
    const mintCall = encodeFunctionData({
      abi: DummyNftAbi,
      functionName: "safeMint",
      args: [accountAddress]
    });
    const callData = encodeFunctionData({
      abi: AccountAbi,
      functionName: "execute",
      args: [cfg.DUMMY_NFT_ADDRESS, 0n, mintCall]
    });
    await sendUserOperation(owner2, callData);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnBatchMint.addEventListener("click", async () => {
  try {
    const accountAddress = await predictAddress();
    const mintCall = encodeFunctionData({
      abi: DummyNftAbi,
      functionName: "safeMint",
      args: [accountAddress]
    });
    const callData = encodeFunctionData({
      abi: AccountAbi,
      functionName: "executeBatch",
      args: [
        [cfg.DUMMY_NFT_ADDRESS, cfg.DUMMY_NFT_ADDRESS],
        [0n, 0n],
        [mintCall, mintCall]
      ]
    });
    await sendUserOperation(owner1, callData);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnGrantSession.addEventListener("click", async () => {
  try {
    const accountAddress = await predictAddress();
    const validUntil = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const grantCall = encodeFunctionData({
      abi: AccountAbi,
      functionName: "grantSessionKey",
      args: [sessionKey.address, validUntil, 5]
    });
    const callData = encodeFunctionData({
      abi: AccountAbi,
      functionName: "execute",
      args: [accountAddress, 0n, grantCall]
    });
    await sendUserOperation(owner1, callData);
    await readSessionKey(accountAddress);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnUseSession.addEventListener("click", async () => {
  try {
    const accountAddress = await predictAddress();
    await readSessionKey(accountAddress);
    const mintCall = encodeFunctionData({
      abi: DummyNftAbi,
      functionName: "safeMint",
      args: [accountAddress]
    });
    const callData = encodeFunctionData({
      abi: AccountAbi,
      functionName: "execute",
      args: [cfg.DUMMY_NFT_ADDRESS, 0n, mintCall]
    });
    await sendUserOperation(sessionKey, callData);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

btnRecover.addEventListener("click", async () => {
  try {
    const newOwner = inputNewOwner.value.trim();
    if (!newOwner) throw new Error("New owner address required");
    const accountAddress = await predictAddress();
    const hash = await walletClient.writeContract({
      address: accountAddress,
      abi: AccountAbi,
      functionName: "guardianAddOwner",
      args: [newOwner],
      account: guardian
    });
    log(`Guardian tx: ${hash}`);
  } catch (e) {
    log(`Error: ${e.message}`);
  }
});

(async () => {
  try {
    const addr = await predictAddress();
    log(`Predicted account: ${addr}`);
  } catch (e) {
    log(`Init error: ${e.message}`);
  }
})();
