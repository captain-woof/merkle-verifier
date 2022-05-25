//SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract MerkleVerifier {
    bytes32 public merkleRootHash;

    constructor(bytes32 _merkleRootHash) {
        merkleRootHash = _merkleRootHash;
    }

    /**
    @notice Verifies merkle proof for the caller's claimed balance
    @param _owner Address of owner whose balance is to be verified
    @param _merkleProof Merkle proof; array of hashes need to proove
    @param _balanceToVerify Balance that caller claims to verify
    @return isVerified True if proof is verified, else false
     */
    function verifyMerkleProof(
        address _owner,
        bytes32[] memory _merkleProof,
        uint256 _balanceToVerify
    ) public view returns (bool) {
        return
            MerkleProof.verify(
                _merkleProof,
                merkleRootHash,
                keccak256(abi.encode(_owner, _balanceToVerify))
            );
    }
}
