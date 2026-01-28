// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import "account-abstraction/contracts/interfaces/IEntryPoint.sol";

import {MultiOwnerAccount} from "./MultiOwnerAccount.sol";

contract MultiOwnerAccountFactory {
    MultiOwnerAccount public immutable accountImplementation;

    constructor(IEntryPoint entryPoint) {
        accountImplementation = new MultiOwnerAccount(entryPoint);
    }

    function createAccount(address[] calldata owners, address guardian, uint256 salt)
        public
        returns (MultiOwnerAccount ret)
    {
        address addr = getAddress(owners, guardian, salt);
        if (addr.code.length > 0) {
            return MultiOwnerAccount(payable(addr));
        }
        bytes memory initData = abi.encodeCall(MultiOwnerAccount.initialize, (owners, guardian));
        ret = MultiOwnerAccount(payable(new ERC1967Proxy{salt: bytes32(salt)}(
            address(accountImplementation),
            initData
        )));
    }

    function getAddress(address[] calldata owners, address guardian, uint256 salt)
        public
        view
        returns (address)
    {
        bytes memory initData = abi.encodeCall(MultiOwnerAccount.initialize, (owners, guardian));
        return Create2.computeAddress(bytes32(salt), keccak256(abi.encodePacked(
            type(ERC1967Proxy).creationCode,
            abi.encode(address(accountImplementation), initData)
        )));
    }
}
