// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DummyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Dummy NFT", "DNFT") Ownable(msg.sender) {}

    function safeMint(address to) public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}
