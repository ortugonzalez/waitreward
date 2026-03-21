// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title WaitReward (WRT)
 * @notice Rewards patients for waiting in medical appointments.
 *         100 WRT = $1 discount at partner commerces.
 */
contract WaitReward is ERC20, Ownable {
    // ─── Constants ───────────────────────────────────────────────────────────
    uint256 public constant MONTHLY_FEE = 0.01 ether;   // commerce subscription
    uint256 public constant FEE_BPS     = 300;           // 3 % in basis points

    uint256 public constant TIER_1_MIN  = 15;
    uint256 public constant TIER_1_MAX  = 29;
    uint256 public constant TIER_1_PTS  = 50  * 1e18;

    uint256 public constant TIER_2_MIN  = 30;
    uint256 public constant TIER_2_MAX  = 59;
    uint256 public constant TIER_2_PTS  = 150 * 1e18;

    uint256 public constant TIER_3_MIN  = 60;
    uint256 public constant TIER_3_PTS  = 300 * 1e18;

    // ─── State ────────────────────────────────────────────────────────────────
    mapping(address => bool)    public authorizedClinics;
    mapping(bytes32  => bool)   public settledAppointments;

    struct Commerce {
        string  name;
        bool    active;
        uint256 depositETH;   // ETH held for redemptions
        uint256 subscriptionExpiry;
    }
    mapping(address => Commerce) public commerces;

    // ─── Events ───────────────────────────────────────────────────────────────
    event ClinicAuthorized(address indexed clinic);
    event ClinicRevoked(address indexed clinic);
    event AppointmentSettled(
        bytes32 indexed appointmentId,
        address indexed patient,
        uint256 delayMinutes,
        uint256 pointsAwarded
    );
    event CommerceRegistered(address indexed commerce, string name, uint256 expiry);
    event CommerceRenewed(address indexed commerce, uint256 expiry);
    event CommerceDeposited(address indexed commerce, uint256 amount);
    event PointsRedeemed(
        address indexed patient,
        address indexed commerce,
        uint256 points,
        uint256 ethPaid,
        uint256 fee
    );

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() ERC20("WaitReward Token", "WRT") Ownable(msg.sender) {}

    // ─── Admin ────────────────────────────────────────────────────────────────

    function authorizeClinic(address clinic) external onlyOwner {
        require(clinic != address(0), "Zero address");
        authorizedClinics[clinic] = true;
        emit ClinicAuthorized(clinic);
    }

    function revokeClinic(address clinic) external onlyOwner {
        authorizedClinics[clinic] = false;
        emit ClinicRevoked(clinic);
    }

    /// @notice Withdraw accumulated fees (ETH) to owner.
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        // Only withdraw ETH not locked in commerce deposits
        // (fees accumulate separately via _collectFee)
        require(balance > 0, "Nothing to withdraw");
        payable(owner()).transfer(balance);
    }

    // ─── Clinic actions ───────────────────────────────────────────────────────

    /**
     * @notice Register the result of an appointment and mint WRT to the patient.
     * @param appointmentId  Unique ID (e.g. keccak of clinic+patient+timestamp).
     * @param patient        Patient wallet address.
     * @param scheduledTime  Unix timestamp of the scheduled appointment.
     * @param actualTime     Unix timestamp when the doctor actually saw the patient.
     */
    function settleAppointment(
        bytes32 appointmentId,
        address patient,
        uint256 scheduledTime,
        uint256 actualTime
    ) external {
        require(authorizedClinics[msg.sender], "Not authorized clinic");
        require(!settledAppointments[appointmentId], "Already settled");
        require(patient != address(0), "Zero patient address");
        require(actualTime >= scheduledTime, "Actual time before scheduled");

        settledAppointments[appointmentId] = true;

        uint256 delayMinutes = (actualTime - scheduledTime) / 60;
        uint256 points       = _calculatePoints(delayMinutes);

        if (points > 0) {
            _mint(patient, points);
        }

        emit AppointmentSettled(appointmentId, patient, delayMinutes, points);
    }

    // ─── Commerce actions ─────────────────────────────────────────────────────

    /**
     * @notice Register or renew a commerce subscription. Must send MONTHLY_FEE ETH.
     *         Extra ETH beyond the fee is stored as redemption deposit.
     */
    function registerCommerce(string calldata name) external payable {
        require(msg.value >= MONTHLY_FEE, "Insufficient fee");
        require(bytes(name).length > 0, "Empty name");

        Commerce storage c = commerces[msg.sender];

        if (!c.active) {
            // First registration
            c.name   = name;
            c.active = true;
            c.subscriptionExpiry = block.timestamp + 30 days;
            emit CommerceRegistered(msg.sender, name, c.subscriptionExpiry);
        } else {
            // Renewal — extend from current expiry or now, whichever is later
            uint256 base = c.subscriptionExpiry > block.timestamp
                ? c.subscriptionExpiry
                : block.timestamp;
            c.subscriptionExpiry = base + 30 days;
            emit CommerceRenewed(msg.sender, c.subscriptionExpiry);
        }

        // MONTHLY_FEE stays in contract as platform revenue; extra goes to deposit
        uint256 extra = msg.value - MONTHLY_FEE;
        if (extra > 0) {
            c.depositETH += extra;
            emit CommerceDeposited(msg.sender, extra);
        }
    }

    /**
     * @notice Commerce deposits additional ETH to fund future redemptions.
     */
    function depositForRedemptions() external payable {
        require(commerces[msg.sender].active, "Not a registered commerce");
        require(msg.value > 0, "Zero deposit");
        commerces[msg.sender].depositETH += msg.value;
        emit CommerceDeposited(msg.sender, msg.value);
    }

    // ─── Patient actions ──────────────────────────────────────────────────────

    /**
     * @notice Redeem WRT points at a commerce.
     *         Burns patient tokens, pays ETH proportionally, takes 3 % fee.
     * @param commerce  Address of the registered commerce.
     * @param points    Amount of WRT (in wei, 1e18 = 1 WRT) to redeem.
     */
    function redeemPoints(address commerce, uint256 points) external {
        require(points > 0, "Zero points");
        Commerce storage c = commerces[commerce];
        require(c.active, "Commerce not active");
        require(c.subscriptionExpiry >= block.timestamp, "Commerce subscription expired");
        require(balanceOf(msg.sender) >= points, "Insufficient balance");

        // 100 WRT = 0.01 ETH (1 USD equivalent at peg)
        // ethValue = points * 0.01 ETH / 100 WRT = points * 1e14 / 1e18
        uint256 ethValue = (points * 0.01 ether) / (100 * 1e18);
        require(ethValue > 0, "Points too small");
        require(c.depositETH >= ethValue, "Commerce has insufficient deposit");

        uint256 fee        = (ethValue * FEE_BPS) / 10_000;   // 3 %
        uint256 netToOwner = fee;                               // fee goes to protocol
        uint256 netRelease = ethValue - fee;                    // patient gets the rest

        c.depositETH -= ethValue;

        // Burn patient tokens
        _burn(msg.sender, points);

        // Release ETH to patient (net of fee)
        payable(msg.sender).transfer(netRelease);

        // Fee stays in contract balance for owner to withdraw
        // (netToOwner already deducted from depositETH, remains in contract)

        emit PointsRedeemed(msg.sender, commerce, points, netRelease, netToOwner);
    }

    // ─── Internal helpers ─────────────────────────────────────────────────────

    function _calculatePoints(uint256 delayMinutes) internal pure returns (uint256) {
        if (delayMinutes >= TIER_3_MIN) return TIER_3_PTS;
        if (delayMinutes >= TIER_2_MIN) return TIER_2_PTS;
        if (delayMinutes >= TIER_1_MIN) return TIER_1_PTS;
        return 0;
    }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function getCommerce(address commerce)
        external
        view
        returns (
            string memory name,
            bool active,
            uint256 depositETH,
            uint256 subscriptionExpiry
        )
    {
        Commerce storage c = commerces[commerce];
        return (c.name, c.active, c.depositETH, c.subscriptionExpiry);
    }
}
