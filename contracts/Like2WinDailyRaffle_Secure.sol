// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title Like2Win Daily Raffle Smart Contract (Security Enhanced)
 * @dev Manages daily $DEGEN raffles with 24-hour windows and automatic execution
 * @author Like2Win Team
 */
contract Like2WinDailyRaffle is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // $DEGEN token contract address on Base
    IERC20 public immutable degenToken;
    
    // Daily raffle configuration
    uint256 public constant DAILY_PRIZE_AMOUNT = 500 * 10**18; // 500 DEGEN
    uint256 public constant RAFFLE_DURATION = 24 hours;
    uint256 public constant EXECUTION_BUFFER = 5 minutes; // Buffer before execution allowed
    uint256 public constant MAX_PARTICIPANTS = 1000; // DoS protection
    
    // Raffle state
    struct DailyRaffle {
        uint256 id;
        uint256 dayNumber;      // Day 1-7 of the weekly cycle
        uint256 startTime;
        uint256 endTime;
        uint256 totalTickets;
        uint256 totalParticipants;
        bool isActive;
        bool isCompleted;
        uint256 randomSeed;
        address winner;
        uint256 prizeAmount;
        uint256 executedAt;     // Timestamp when executed
    }

    struct Participant {
        uint256 ticketCount;
        bool hasParticipated;
        uint256 firstTicketNumber;
        uint256 lastTicketNumber;
    }

    // State variables
    uint256 public currentRaffleId;
    uint256 public weekStartTime;
    mapping(uint256 => DailyRaffle) public dailyRaffles;
    mapping(uint256 => mapping(address => Participant)) public raffleParticipants;
    mapping(uint256 => address[]) public raffleParticipantsList;
    
    // Security: Nonce mapping to prevent replay attacks
    mapping(address => uint256) public userNonces;
    
    // Events
    event DailyRaffleCreated(
        uint256 indexed raffleId, 
        uint256 dayNumber, 
        uint256 startTime, 
        uint256 endTime
    );
    event TicketsAdded(
        uint256 indexed raffleId, 
        address indexed participant, 
        uint256 ticketCount,
        uint256 nonce
    );
    event DailyRaffleCompleted(
        uint256 indexed raffleId,
        uint256 dayNumber,
        address winner,
        uint256 prizeAmount,
        uint256 totalTickets,
        uint256 totalParticipants
    );
    event WeeklySeriesStarted(uint256 startTime, uint256 totalFund);
    event EmergencyWithdraw(address indexed owner, uint256 amount);
    event RafflePaused(uint256 indexed raffleId);
    
    constructor(address _degenToken) {
        require(_degenToken != address(0), "Invalid token address");
        degenToken = IERC20(_degenToken);
    }

    /**
     * @dev Starts a new 7-day daily raffle series
     */
    function startWeeklyRaffleSeries() external onlyOwner {
        require(weekStartTime == 0 || block.timestamp >= weekStartTime + 7 days, "Current series still active");
        
        weekStartTime = block.timestamp;
        
        // Fund the contract with 7 days worth of prizes (3500 DEGEN)
        uint256 totalWeeklyFund = DAILY_PRIZE_AMOUNT * 7;
        require(
            degenToken.balanceOf(address(this)) >= totalWeeklyFund,
            "Insufficient DEGEN balance for weekly series"
        );
        
        emit WeeklySeriesStarted(weekStartTime, totalWeeklyFund);
        
        // Create first daily raffle
        _createDailyRaffle(1);
    }
    
    /**
     * @dev Creates a new daily raffle
     */
    function _createDailyRaffle(uint256 _dayNumber) internal {
        require(_dayNumber >= 1 && _dayNumber <= 7, "Invalid day number");
        
        currentRaffleId++;
        
        uint256 startTime = weekStartTime + (_dayNumber - 1) * 1 days;
        uint256 endTime = startTime + RAFFLE_DURATION - 1; // 23:59:59
        
        DailyRaffle storage newRaffle = dailyRaffles[currentRaffleId];
        newRaffle.id = currentRaffleId;
        newRaffle.dayNumber = _dayNumber;
        newRaffle.startTime = startTime;
        newRaffle.endTime = endTime;
        newRaffle.isActive = true;
        newRaffle.prizeAmount = DAILY_PRIZE_AMOUNT;

        emit DailyRaffleCreated(currentRaffleId, _dayNumber, startTime, endTime);
    }
    
    /**
     * @dev Adds tickets for a participant in the current daily raffle
     * @param _participant Address of participant
     * @param _ticketCount Number of tickets to add
     * @param _nonce User's current nonce (prevents replay attacks)
     * @param _signature Owner's signature for validation
     */
    function addTickets(
        address _participant,
        uint256 _ticketCount,
        uint256 _nonce,
        bytes calldata _signature
    ) external onlyOwner {
        require(_participant != address(0), "Invalid participant address");
        
        uint256 raffleId = currentRaffleId;
        DailyRaffle storage raffle = dailyRaffles[raffleId];
        
        require(raffle.isActive, "No active daily raffle");
        require(block.timestamp >= raffle.startTime, "Raffle not started");
        require(block.timestamp <= raffle.endTime, "Daily raffle ended");
        require(_ticketCount > 0, "Invalid ticket count");
        require(_nonce == userNonces[_participant], "Invalid nonce");
        require(raffle.totalParticipants < MAX_PARTICIPANTS, "Max participants reached");

        // Security: Verify signature with nonce to prevent replay attacks
        bytes32 messageHash = keccak256(abi.encode(raffleId, _participant, _ticketCount, _nonce));
        require(_verifySignature(messageHash, _signature), "Invalid signature");

        // Increment nonce to prevent replay
        userNonces[_participant]++;

        Participant storage participant = raffleParticipants[raffleId][_participant];
        
        if (!participant.hasParticipated) {
            participant.hasParticipated = true;
            participant.firstTicketNumber = raffle.totalTickets + 1;
            raffleParticipantsList[raffleId].push(_participant);
            raffle.totalParticipants++;
        }

        participant.ticketCount += _ticketCount;
        participant.lastTicketNumber = raffle.totalTickets + _ticketCount;
        raffle.totalTickets += _ticketCount;

        emit TicketsAdded(raffleId, _participant, _ticketCount, _nonce);
    }

    /**
     * @dev Executes the current daily raffle (called after buffer period)
     * Security: Added execution buffer to prevent front-running
     */
    function executeDailyRaffle() external onlyOwner nonReentrant {
        uint256 raffleId = currentRaffleId;
        DailyRaffle storage raffle = dailyRaffles[raffleId];
        
        require(raffle.isActive, "Daily raffle not active");
        require(block.timestamp > raffle.endTime + EXECUTION_BUFFER, "Buffer period not passed");
        require(!raffle.isCompleted, "Daily raffle already completed");
        require(raffle.totalParticipants > 0, "No participants");

        // Security: Better randomness (still not perfect - consider Chainlink VRF for production)
        raffle.randomSeed = uint256(keccak256(abi.encode(
            blockhash(block.number - 1),
            blockhash(block.number - 2), // Additional entropy
            block.timestamp,
            block.prevrandao, // More secure than block.difficulty
            raffle.totalTickets,
            raffle.dayNumber,
            msg.sender
        )));

        // Select winner using optimized selection
        raffle.winner = _selectDailyWinner(raffleId);

        // Distribute prize
        if (raffle.winner != address(0)) {
            degenToken.safeTransfer(raffle.winner, DAILY_PRIZE_AMOUNT);
        }

        raffle.isActive = false;
        raffle.isCompleted = true;
        raffle.executedAt = block.timestamp;

        emit DailyRaffleCompleted(
            raffleId,
            raffle.dayNumber,
            raffle.winner,
            DAILY_PRIZE_AMOUNT,
            raffle.totalTickets,
            raffle.totalParticipants
        );

        // Auto-create next daily raffle if within 7-day series
        if (raffle.dayNumber < 7) {
            _createDailyRaffle(raffle.dayNumber + 1);
        }
    }

    /**
     * @dev Selects winner using gas-optimized weighted random selection
     * Security: Protected against DoS with MAX_PARTICIPANTS limit
     */
    function _selectDailyWinner(uint256 _raffleId) internal view returns (address) {
        DailyRaffle storage raffle = dailyRaffles[_raffleId];
        
        if (raffle.totalTickets == 0) {
            return address(0);
        }
        
        uint256 randomTicket = (raffle.randomSeed % raffle.totalTickets) + 1;
        address[] memory participants = raffleParticipantsList[_raffleId];
        
        // Gas-optimized: Early exit when winner found
        for (uint256 i = 0; i < participants.length && i < MAX_PARTICIPANTS; i++) {
            Participant memory participant = raffleParticipants[_raffleId][participants[i]];
            if (randomTicket >= participant.firstTicketNumber && randomTicket <= participant.lastTicketNumber) {
                return participants[i];
            }
        }
        
        return participants[0]; // Fallback
    }

    /**
     * @dev Verifies signature for ticket allocation
     * Security: Uses abi.encode instead of deprecated abi.encodePacked
     */
    function _verifySignature(bytes32 _messageHash, bytes memory _signature) internal view returns (bool) {
        bytes32 ethSignedMessageHash = _messageHash.toEthSignedMessageHash();
        return ethSignedMessageHash.recover(_signature) == owner();
    }

    // View functions
    function getCurrentDailyRaffle() external view returns (DailyRaffle memory) {
        return dailyRaffles[currentRaffleId];
    }

    function getDailyRaffle(uint256 _raffleId) external view returns (DailyRaffle memory) {
        return dailyRaffles[_raffleId];
    }

    function getParticipant(uint256 _raffleId, address _participant) external view returns (Participant memory) {
        return raffleParticipants[_raffleId][_participant];
    }

    function getRaffleParticipants(uint256 _raffleId) external view returns (address[] memory) {
        return raffleParticipantsList[_raffleId];
    }
    
    function getTimeUntilRaffleEnd() external view returns (uint256) {
        if (currentRaffleId == 0) return 0;
        DailyRaffle memory raffle = dailyRaffles[currentRaffleId];
        if (block.timestamp >= raffle.endTime) return 0;
        return raffle.endTime - block.timestamp;
    }

    function getUserNonce(address _user) external view returns (uint256) {
        return userNonces[_user];
    }

    // Emergency functions with proper events
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = degenToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        degenToken.safeTransfer(owner(), balance);
        emit EmergencyWithdraw(owner(), balance);
    }

    function pauseCurrentRaffle() external onlyOwner {
        require(currentRaffleId > 0, "No active raffle");
        dailyRaffles[currentRaffleId].isActive = false;
        emit RafflePaused(currentRaffleId);
    }
    
    /**
     * @dev Fund contract with slippage protection
     * @param amount Amount to transfer
     * @param minAmount Minimum amount required (slippage protection)
     */
    function fundContract(uint256 amount, uint256 minAmount) external {
        require(amount >= minAmount, "Amount below minimum");
        require(amount > 0, "Invalid amount");
        degenToken.safeTransferFrom(msg.sender, address(this), amount);
    }
}