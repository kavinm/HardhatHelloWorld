import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseAbiItem } from "viem";

// Helper function to compare Ethereum addresses case-insensitively
function compareAddresses(address1: string, address2: string): boolean {
  return address1.toLowerCase() === address2.toLowerCase();
}

describe("HelloWorld", function () {
  async function deployFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const contract = await hre.viem.deployContract("HelloWorld", [
      "Initial Greeting",
    ]);
    const publicClient = await hre.viem.getPublicClient();
    return {
      owner,
      otherAccount,
      publicClient,
      contract,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with initial greeting", async function () {
      const { contract } = await loadFixture(deployFixture);
      expect(await contract.read.getGreeting()).to.equal("Initial Greeting");
    });

    it("Should set the right owner", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      const contractOwner = await contract.read.owner();
      expect(compareAddresses(contractOwner, owner.account.address)).to.be.true;
    });
  });

  describe("Greetings", function () {
    it("Should allow owner to set a new greeting", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await contract.write.setGreeting(["New Greeting"], {
        account: owner.account,
      });
      expect(await contract.read.getGreeting()).to.equal("New Greeting");
    });

    it("Should emit NewGreeting event when setting greeting", async function () {
      const { contract, owner, publicClient } = await loadFixture(
        deployFixture
      );

      const tx = await contract.write.setGreeting(["Event Greeting"], {
        account: owner.account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      const logs = await publicClient.getLogs({
        address: contract.address,
        event: parseAbiItem(
          "event NewGreeting(address indexed sender, string message, uint256 timestamp)"
        ),
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      expect(logs).to.have.lengthOf(1);
      expect(logs[0].args.message).to.equal("Event Greeting");
      expect(
        compareAddresses(logs[0].args.sender as string, owner.account.address)
      ).to.be.true;
    });

    it("Should not allow non-owner to set greeting", async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      await expect(
        contract.write.setGreeting(["Unauthorized Greeting"], {
          account: otherAccount.account,
        })
      ).to.be.rejectedWith("Only the owner can perform this action");
    });
  });

  describe("Ownership", function () {
    it("Should allow owner to transfer ownership", async function () {
      const { contract, owner, otherAccount } = await loadFixture(
        deployFixture
      );
      await contract.write.transferOwnership([otherAccount.account.address], {
        account: owner.account,
      });
      const newOwner = await contract.read.owner();
      expect(compareAddresses(newOwner, otherAccount.account.address)).to.be
        .true;
    });

    it("Should emit OwnershipTransferred event when transferring ownership", async function () {
      const { contract, owner, otherAccount, publicClient } = await loadFixture(
        deployFixture
      );

      const tx = await contract.write.transferOwnership(
        [otherAccount.account.address],
        { account: owner.account }
      );
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: tx,
      });

      const logs = await publicClient.getLogs({
        address: contract.address,
        event: parseAbiItem(
          "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)"
        ),
        fromBlock: receipt.blockNumber,
        toBlock: receipt.blockNumber,
      });

      expect(logs).to.have.lengthOf(1);
      expect(
        compareAddresses(
          logs[0].args.previousOwner as string,
          owner.account.address
        )
      ).to.be.true;
      expect(
        compareAddresses(
          logs[0].args.newOwner as string,
          otherAccount.account.address
        )
      ).to.be.true;
    });

    it("Should not allow non-owner to transfer ownership", async function () {
      const { contract, otherAccount } = await loadFixture(deployFixture);
      await expect(
        contract.write.transferOwnership([otherAccount.account.address], {
          account: otherAccount.account,
        })
      ).to.be.rejectedWith("Only the owner can perform this action");
    });

    it("Should not allow transferring ownership to zero address", async function () {
      const { contract, owner } = await loadFixture(deployFixture);
      await expect(
        contract.write.transferOwnership(
          ["0x0000000000000000000000000000000000000000"],
          { account: owner.account }
        )
      ).to.be.rejectedWith("New owner must be a valid address");
    });
  });

  describe("LastUpdated", function () {
    it("Should update lastUpdated when setting greeting", async function () {
      const { contract, owner, publicClient } = await loadFixture(
        deployFixture
      );

      const oldLastUpdated = await contract.read.lastUpdated();
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second

      await contract.write.setGreeting(["New Greeting"], {
        account: owner.account,
      });
      const newLastUpdated = await contract.read.lastUpdated();

      expect(Number(newLastUpdated)).to.be.greaterThan(Number(oldLastUpdated));
    });
  });
});
