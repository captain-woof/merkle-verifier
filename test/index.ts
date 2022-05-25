import chai from "chai";
import { BigNumber, Signer } from "ethers";
import { ethers } from "hardhat";
import { MerkleTree } from "merkletreejs";
import { MerkleVerifier } from "../typechain";
import chaiAsPromised from "chai-as-promised";

const { expect, assert } = chai.use(chaiAsPromised);

/////////////////////
// TYPES
/////////////////////
type BalanceRecord = {
  address: string;
  balance: BigNumber;
}

describe("MerkleVerifier contract", function () {

  /////////////////////
  // VARIABLES
  /////////////////////
  let signers: Array<Signer>;
  let balances: Array<BalanceRecord> = [];
  let balancesEncoded: Array<string> = [];
  let merkleTree: MerkleTree;
  let balanceMapForTesting: { [address: string]: BigNumber } = {};
  let merkleVerifier: MerkleVerifier;

  /////////////////////
  // BEFORE HOOK
  /////////////////////

  beforeEach(async () => {

    // Create array of balances
    signers = await ethers.getSigners();
    for await (let signer of signers) {
      const balance = ethers.utils.parseUnits((Math.random() * 300).toFixed(0), 18);
      const address = await signer.getAddress();

      balances.push({ address, balance });
      balanceMapForTesting[address] = balance;
    }

    // Create merkle leaves
    balancesEncoded = balances.map(({ address, balance }) => (
      ethers.utils.defaultAbiCoder.encode(
        ["address", "uint256"],
        [address, balance]
      )
    ));

    // Create merkle tree
    merkleTree = new MerkleTree(balancesEncoded, ethers.utils.keccak256, {
      duplicateOdd: true,
      hashLeaves: true,
      sort: true
    });

    // Deploy contract
    const merkleVerifierFactory = await ethers.getContractFactory("MerkleVerifier");
    merkleVerifier = await merkleVerifierFactory.deploy(merkleTree.getHexRoot());
    await merkleVerifier.deployed();
  });

  /////////////////////
  // TEST
  /////////////////////
  it("Merkle proofs should be correctly verified", async function () {
    // Test for true
    const signer1Addr = await signers[4].getAddress();
    const signer1Balance = balanceMapForTesting[signer1Addr];
    const signer1MerkleProof = merkleTree.getHexProof(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [signer1Addr, signer1Balance]
        )
      )
    );

    const result1 = await merkleVerifier.verifyMerkleProof(signer1Addr, signer1MerkleProof, signer1Balance);
    assert.isTrue(result1, "Incorrect result; must have been true!");

    // Test for false
    const signer2Addr = await signers[6].getAddress();
    const signer2Balance = ethers.utils.parseUnits((Math.random() * 300).toFixed(0), 18);
    const signer2MerkleProof = merkleTree.getHexProof(
      ethers.utils.keccak256(
        ethers.utils.defaultAbiCoder.encode(
          ["address", "uint256"],
          [signer2Addr, signer2Balance]
        )
      )
    );

    const result2 = await merkleVerifier.verifyMerkleProof(signer2Addr, signer2MerkleProof, signer2Balance);
    assert.isFalse(result2, "Incorrect result; must have been false!");
  });
});
