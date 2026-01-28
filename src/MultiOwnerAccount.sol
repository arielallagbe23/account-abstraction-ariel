// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

/*
 Minimal multi-owner ERC-4337 Smart Contract Wallet for EntryPoint v0.7
 - Multi-owner (1-of-N) authorization
 - Transaction batching (executeBatch)
 - Session keys with expiry and optional use-count
 - Simple social recovery with a guardian that can add owners
*/

import "account-abstraction/contracts/core/BaseAccount.sol";
import "account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract MultiOwnerAccount is BaseAccount, UUPSUpgradeable, Initializable, ERC721Holder {
    using ECDSA for bytes32;

    IEntryPoint private immutable _entryPoint;

    uint256 private constant SIG_VALIDATION_SUCCESS = 0;
    uint256 private constant SIG_VALIDATION_FAILED = 1;

    mapping(address => bool) public isOwner;
    uint256 public ownersCount;

    address public guardian;

    struct SessionKey {
        uint64 validUntil;      // timestamp inclusive; 0 means disabled
        uint32 usesRemaining;   // 0 means exhausted; use type(uint32).max for unlimited
    }
    mapping(address => SessionKey) public sessionKeys;

    event Initialized(IEntryPoint indexed entryPoint, address[] owners, address guardian);
    event OwnerAdded(address indexed owner);
    event OwnerRemoved(address indexed owner);
    event GuardianChanged(address indexed guardian);
    event SessionKeyGranted(address indexed key, uint64 validUntil, uint32 usesRemaining);
    event SessionKeyRevoked(address indexed key);

    modifier onlyOwner() {
        require(isOwner[msg.sender] || msg.sender == address(this), "MOA:not-owner");
        _;
    }

    constructor(IEntryPoint entryPoint_) {
        _entryPoint = entryPoint_;
        _disableInitializers();
    }

    function entryPoint() public view override returns (IEntryPoint) {
        return _entryPoint;
    }

    receive() external payable {}

    function initialize(address[] calldata owners_, address guardian_) public initializer {
        require(owners_.length > 0, "MOA:no-owners");
        for (uint256 i = 0; i < owners_.length; i++) {
            address o = owners_[i];
            require(o != address(0), "MOA:zero-owner");
            if (!isOwner[o]) {
                isOwner[o] = true;
                ownersCount += 1;
                emit OwnerAdded(o);
            }
        }
        guardian = guardian_;
        emit GuardianChanged(guardian_);
        emit Initialized(_entryPoint, owners_, guardian_);
    }

    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        require(isOwner[msg.sender], "MOA:not-owner");
    }

    // --- Owner management ---

    function addOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "MOA:zero-owner");
        require(!isOwner[newOwner], "MOA:exists");
        isOwner[newOwner] = true;
        ownersCount += 1;
        emit OwnerAdded(newOwner);
    }

    function removeOwner(address owner_) external onlyOwner {
        require(isOwner[owner_], "MOA:not-owner-addr");
        require(ownersCount > 1, "MOA:min-1-owner");
        isOwner[owner_] = false;
        ownersCount -= 1;
        emit OwnerRemoved(owner_);
    }

    // --- Social recovery ---

    function setGuardian(address newGuardian) external onlyOwner {
        guardian = newGuardian;
        emit GuardianChanged(newGuardian);
    }

    function guardianAddOwner(address newOwner) external {
        require(msg.sender == guardian, "MOA:not-guardian");
        require(newOwner != address(0), "MOA:zero-owner");
        if (!isOwner[newOwner]) {
            isOwner[newOwner] = true;
            ownersCount += 1;
            emit OwnerAdded(newOwner);
        }
    }

    // --- Session keys ---

    function grantSessionKey(address key, uint64 validUntil, uint32 usesRemaining) external onlyOwner {
        require(key != address(0), "MOA:zero-key");
        sessionKeys[key] = SessionKey({ validUntil: validUntil, usesRemaining: usesRemaining });
        emit SessionKeyGranted(key, validUntil, usesRemaining);
    }

    function revokeSessionKey(address key) external onlyOwner {
        delete sessionKeys[key];
        emit SessionKeyRevoked(key);
    }

    // --- Execution ---

    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrAuth();
        _call(dest, value, func);
    }

    function executeBatch(address[] calldata dest, uint256[] calldata value, bytes[] calldata func) external {
        _requireFromEntryPointOrAuth();
        require(dest.length == func.length && (value.length == 0 || value.length == func.length), "MOA:bad-args");
        if (value.length == 0) {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], 0, func[i]);
            }
        } else {
            for (uint256 i = 0; i < dest.length; i++) {
                _call(dest[i], value[i], func[i]);
            }
        }
    }

    function noop() external {
        _requireFromEntryPointOrAuth();
    }

    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    function _requireFromEntryPointOrAuth() internal view {
        if (msg.sender == address(entryPoint())) return;
        if (isOwner[msg.sender]) return;
        revert("MOA:not-auth");
    }

    // --- EntryPoint accounting helpers ---

    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    // --- Signature validation (ERC-4337) ---

    function _validateSignature(PackedUserOperation calldata userOp, bytes32 userOpHash)
        internal
        override
        returns (uint256 validationData)
    {
        bytes32 hash = MessageHashUtils.toEthSignedMessageHash(userOpHash);
        address signer = ECDSA.recover(hash, userOp.signature);

        if (isOwner[signer]) {
            return SIG_VALIDATION_SUCCESS;
        }

        SessionKey storage sk = sessionKeys[signer];
        if (sk.validUntil != 0 && block.timestamp <= sk.validUntil) {
            if (sk.usesRemaining > 0) {
                if (sk.usesRemaining != type(uint32).max) {
                    sk.usesRemaining = sk.usesRemaining - 1;
                }
                return SIG_VALIDATION_SUCCESS;
            }
        }

        return SIG_VALIDATION_FAILED;
    }
}
