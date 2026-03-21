const { expect }         = require("chai");
const { ethers }         = require("hardhat");
const { time }           = require("@nomicfoundation/hardhat-network-helpers");

describe("WaitReward", function () {
  let contract, owner, clinic, patient, commerce, other;

  const MONTHLY_FEE  = ethers.parseEther("0.01");
  const ONE_WRT      = ethers.parseEther("1");
  const HUNDRED_WRT  = ethers.parseEther("100");

  // Helper: generate a unique appointmentId
  let apptCounter = 0;
  function newApptId() {
    apptCounter++;
    return ethers.keccak256(ethers.toUtf8Bytes(`appt-${apptCounter}`));
  }

  // Helper: timestamps (seconds)
  const now        = () => Math.floor(Date.now() / 1000);
  const scheduled  = now();

  beforeEach(async () => {
    [owner, clinic, patient, commerce, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("WaitReward");
    contract = await Factory.deploy();

    // Authorize clinic by default
    await contract.connect(owner).authorizeClinic(clinic.address);
  });

  // ─── Deployment ────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("sets correct name and symbol", async () => {
      expect(await contract.name()).to.equal("WaitReward Token");
      expect(await contract.symbol()).to.equal("WRT");
    });

    it("owner is deployer", async () => {
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("initial supply is zero", async () => {
      expect(await contract.totalSupply()).to.equal(0n);
    });
  });

  // ─── Clinic authorization ─────────────────────────────────────────────────
  describe("Clinic authorization", () => {
    it("owner can authorize a clinic", async () => {
      expect(await contract.authorizedClinics(clinic.address)).to.be.true;
    });

    it("emits ClinicAuthorized event", async () => {
      await expect(contract.connect(owner).authorizeClinic(other.address))
        .to.emit(contract, "ClinicAuthorized")
        .withArgs(other.address);
    });

    it("owner can revoke a clinic", async () => {
      await contract.connect(owner).revokeClinic(clinic.address);
      expect(await contract.authorizedClinics(clinic.address)).to.be.false;
    });

    it("non-owner cannot authorize", async () => {
      await expect(
        contract.connect(other).authorizeClinic(other.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts on zero address", async () => {
      await expect(
        contract.connect(owner).authorizeClinic(ethers.ZeroAddress)
      ).to.be.revertedWith("Zero address");
    });
  });

  // ─── settleAppointment ────────────────────────────────────────────────────
  describe("settleAppointment", () => {
    it("no points for delay < 15 min", async () => {
      const apptId = newApptId();
      const actual = scheduled + 14 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      expect(await contract.balanceOf(patient.address)).to.equal(0n);
    });

    it("50 pts for 15-29 min delay", async () => {
      const apptId = newApptId();
      const actual = scheduled + 20 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      expect(await contract.balanceOf(patient.address)).to.equal(ethers.parseEther("50"));
    });

    it("150 pts for 30-59 min delay", async () => {
      const apptId = newApptId();
      const actual = scheduled + 45 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      expect(await contract.balanceOf(patient.address)).to.equal(ethers.parseEther("150"));
    });

    it("300 pts for 60+ min delay", async () => {
      const apptId = newApptId();
      const actual = scheduled + 90 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      expect(await contract.balanceOf(patient.address)).to.equal(ethers.parseEther("300"));
    });

    it("exact 15-min boundary → 50 pts", async () => {
      const apptId = newApptId();
      const actual = scheduled + 15 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      expect(await contract.balanceOf(patient.address)).to.equal(ethers.parseEther("50"));
    });

    it("exact 60-min boundary → 300 pts", async () => {
      const apptId = newApptId();
      const actual = scheduled + 60 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      expect(await contract.balanceOf(patient.address)).to.equal(ethers.parseEther("300"));
    });

    it("emits AppointmentSettled event", async () => {
      const apptId = newApptId();
      const actual = scheduled + 30 * 60;
      await expect(
        contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual)
      )
        .to.emit(contract, "AppointmentSettled")
        .withArgs(apptId, patient.address, 30n, ethers.parseEther("150"));
    });

    it("reverts on duplicate appointmentId", async () => {
      const apptId = newApptId();
      const actual = scheduled + 30 * 60;
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      await expect(
        contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual)
      ).to.be.revertedWith("Already settled");
    });

    it("reverts if caller not authorized clinic", async () => {
      const apptId = newApptId();
      await expect(
        contract.connect(other).settleAppointment(apptId, patient.address, scheduled, scheduled + 60)
      ).to.be.revertedWith("Not authorized clinic");
    });

    it("reverts if actualTime < scheduledTime", async () => {
      const apptId = newApptId();
      await expect(
        contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, scheduled - 1)
      ).to.be.revertedWith("Actual time before scheduled");
    });

    it("reverts on zero patient address", async () => {
      const apptId = newApptId();
      await expect(
        contract.connect(clinic).settleAppointment(apptId, ethers.ZeroAddress, scheduled, scheduled + 60)
      ).to.be.revertedWith("Zero patient address");
    });

    it("revoked clinic cannot settle", async () => {
      await contract.connect(owner).revokeClinic(clinic.address);
      const apptId = newApptId();
      await expect(
        contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, scheduled + 60)
      ).to.be.revertedWith("Not authorized clinic");
    });
  });

  // ─── registerCommerce ─────────────────────────────────────────────────────
  describe("registerCommerce", () => {
    it("registers with exact monthly fee", async () => {
      await contract.connect(commerce).registerCommerce("Farmacia Central", { value: MONTHLY_FEE });
      const [name, active, , expiry] = await contract.getCommerce(commerce.address);
      expect(name).to.equal("Farmacia Central");
      expect(active).to.be.true;
      expect(expiry).to.be.gt(0n);
    });

    it("emits CommerceRegistered event", async () => {
      await expect(
        contract.connect(commerce).registerCommerce("Café Bio", { value: MONTHLY_FEE })
      ).to.emit(contract, "CommerceRegistered");
    });

    it("extra ETH is stored as deposit", async () => {
      const extra = ethers.parseEther("0.05");
      await contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE + extra });
      const [, , deposit] = await contract.getCommerce(commerce.address);
      expect(deposit).to.equal(extra);
    });

    it("reverts with insufficient fee", async () => {
      await expect(
        contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE - 1n })
      ).to.be.revertedWith("Insufficient fee");
    });

    it("reverts with empty name", async () => {
      await expect(
        contract.connect(commerce).registerCommerce("", { value: MONTHLY_FEE })
      ).to.be.revertedWith("Empty name");
    });

    it("renewal extends subscription by 30 days", async () => {
      await contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE });
      const [, , , expiry1] = await contract.getCommerce(commerce.address);
      await contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE });
      const [, , , expiry2] = await contract.getCommerce(commerce.address);
      expect(expiry2 - expiry1).to.be.closeTo(30n * 24n * 3600n, 5n);
    });

    it("depositForRedemptions adds to deposit", async () => {
      await contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE });
      const extra = ethers.parseEther("0.1");
      await contract.connect(commerce).depositForRedemptions({ value: extra });
      const [, , deposit] = await contract.getCommerce(commerce.address);
      expect(deposit).to.equal(extra);
    });
  });

  // ─── redeemPoints ─────────────────────────────────────────────────────────
  describe("redeemPoints", () => {
    async function setupWithTokensAndCommerce(patientPoints) {
      // Mint tokens to patient via settled appointment
      const apptId = newApptId();
      const actual = scheduled + 60 * 60; // 300 pts
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, actual);
      // If we need more, settle more appointments
      while ((await contract.balanceOf(patient.address)) < patientPoints) {
        const id2 = newApptId();
        await contract.connect(clinic).settleAppointment(id2, patient.address, scheduled, actual);
      }

      // Register commerce with deposit
      const deposit = ethers.parseEther("1");
      await contract.connect(commerce).registerCommerce("Farmacia", {
        value: MONTHLY_FEE + deposit,
      });
    }

    it("burns tokens and releases ETH to patient", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);

      const before = await ethers.provider.getBalance(patient.address);
      const tx = await contract.connect(patient).redeemPoints(commerce.address, HUNDRED_WRT);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * tx.gasPrice;
      const after = await ethers.provider.getBalance(patient.address);

      // 100 WRT → 0.01 ETH gross, 3% fee → net 0.0097 ETH
      const expectedNet = ethers.parseEther("0.0097");
      expect(after - before + gasUsed).to.equal(expectedNet);
      // started with 300 WRT, redeemed 100 → 200 WRT remaining
      expect(await contract.balanceOf(patient.address)).to.equal(ethers.parseEther("200"));
    });

    it("fee stays in contract", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);
      const contractBefore = await ethers.provider.getBalance(await contract.getAddress());

      await contract.connect(patient).redeemPoints(commerce.address, HUNDRED_WRT);

      const contractAfter = await ethers.provider.getBalance(await contract.getAddress());
      // Contract started with MONTHLY_FEE + 1 ETH deposit
      // Released 0.0097 ETH to patient, 0.0003 ETH fee stays → net -0.0097
      const ethValue = ethers.parseEther("0.01");
      const fee      = (ethValue * 300n) / 10_000n;
      const net      = ethValue - fee;
      expect(contractBefore - contractAfter).to.equal(net);
    });

    it("commerce deposit decreases correctly", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);
      const [, , depositBefore] = await contract.getCommerce(commerce.address);

      await contract.connect(patient).redeemPoints(commerce.address, HUNDRED_WRT);

      const [, , depositAfter] = await contract.getCommerce(commerce.address);
      expect(depositBefore - depositAfter).to.equal(ethers.parseEther("0.01"));
    });

    it("emits PointsRedeemed event", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);
      const fee = (ethers.parseEther("0.01") * 300n) / 10_000n;
      const net = ethers.parseEther("0.01") - fee;
      await expect(
        contract.connect(patient).redeemPoints(commerce.address, HUNDRED_WRT)
      )
        .to.emit(contract, "PointsRedeemed")
        .withArgs(patient.address, commerce.address, HUNDRED_WRT, net, fee);
    });

    it("reverts on zero points", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);
      await expect(
        contract.connect(patient).redeemPoints(commerce.address, 0n)
      ).to.be.revertedWith("Zero points");
    });

    it("reverts if commerce not active", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);
      await expect(
        contract.connect(patient).redeemPoints(other.address, HUNDRED_WRT)
      ).to.be.revertedWith("Commerce not active");
    });

    it("reverts if insufficient patient balance", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);
      const tooMany = ethers.parseEther("99999");
      await expect(
        contract.connect(patient).redeemPoints(commerce.address, tooMany)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("reverts if commerce deposit too low", async () => {
      // Register commerce without extra deposit
      await contract.connect(commerce).registerCommerce("PoorShop", { value: MONTHLY_FEE });

      // Give patient tokens
      const apptId = newApptId();
      await contract.connect(clinic).settleAppointment(apptId, patient.address, scheduled, scheduled + 3600);

      await expect(
        contract.connect(patient).redeemPoints(commerce.address, HUNDRED_WRT)
      ).to.be.revertedWith("Commerce has insufficient deposit");
    });

    it("reverts if commerce subscription expired", async () => {
      await setupWithTokensAndCommerce(HUNDRED_WRT);

      // Fast-forward 31 days
      await time.increase(31 * 24 * 3600);

      await expect(
        contract.connect(patient).redeemPoints(commerce.address, HUNDRED_WRT)
      ).to.be.revertedWith("Commerce subscription expired");
    });
  });

  // ─── withdrawFees ──────────────────────────────────────────────────────────
  describe("withdrawFees", () => {
    it("owner can withdraw ETH balance", async () => {
      await contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE });
      const before = await ethers.provider.getBalance(owner.address);
      const tx = await contract.connect(owner).withdrawFees();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * tx.gasPrice;
      const after = await ethers.provider.getBalance(owner.address);
      expect(after - before + gasUsed).to.equal(MONTHLY_FEE);
    });

    it("non-owner cannot withdraw", async () => {
      await contract.connect(commerce).registerCommerce("Farmacia", { value: MONTHLY_FEE });
      await expect(
        contract.connect(other).withdrawFees()
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("reverts if nothing to withdraw", async () => {
      await expect(contract.connect(owner).withdrawFees()).to.be.revertedWith("Nothing to withdraw");
    });
  });
});
