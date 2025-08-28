// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title Like2Win Raffle Smart Contract
 * @dev Manages bi-weekly $DEGEN raffles with transparent random number generation
 * @author Like2Win Team
 */
contract Like2WinRaffle is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // $DEGEN token contract
    IERC20 public immutable degenToken;
    
    // Raffle state
    struct Raffle {
        uint256 id;
        string weekPeriod;
        uint256 startDate;
        uint256 endDate;
        uint256 totalPool;
        uint256 totalTickets;
        uint256 totalParticipants;
        bool isActive;
        bool isCompleted;
        uint256 randomSeed;
        address firstPlace;
        address secondPlace;
        address thirdPlace;
        uint256 firstPrize;
        uint256 secondPrize;
        uint256 thirdPrize;
    }

    struct Participant {
        uint256 ticketCount;
        bool hasParticipated;
        uint256 firstTicketNumber;
        uint256 lastTicketNumber;
    }

    // State variables
    uint256 public currentRaffleId;
    mapping(uint256 => Raffle) public raffles;
    mapping(uint256 => mapping(address => Participant)) public raffleParticipants;
    mapping(uint256 => address[]) public raffleParticipantsList;
    
    // Prize distribution (percentages out of 10000)
    uint256 public constant FIRST_PLACE_PERCENTAGE = 5000;  // 50%
    uint256 public constant SECOND_PLACE_PERCENTAGE = 3000; // 30%
    uint256 public constant THIRD_PLACE_PERCENTAGE = 2000;  // 20%
    
    // Events
    event RaffleCreated(uint256 indexed raffleId, string weekPeriod, uint256 startDate, uint256 endDate);
    event TicketsAdded(uint256 indexed raffleId, address indexed participant, uint256 ticketCount);
    event PoolContribution(uint256 indexed raffleId, uint256 amount, string source);
    event RaffleCompleted(
        uint256 indexed raffleId,
        address firstPlace,
        address secondPlace, 
        address thirdPlace,
        uint256 firstPrize,
        uint256 secondPrize,
        uint256 thirdPrize
    );

    constructor(address _degenToken) {
        degenToken = IERC20(_degenToken);
    }

    /**
     * @dev Creates a new bi-weekly raffle
     */
    function createRaffle(
        string memory _weekPeriod,
        uint256 _startDate,
        uint256 _endDate
    ) external onlyOwner {
        require(_startDate < _endDate, "Invalid dates");
        require(!raffles[currentRaffleId].isActive, "Current raffle still active");

        currentRaffleId++;
        
        Raffle storage newRaffle = raffles[currentRaffleId];
        newRaffle.id = currentRaffleId;
        newRaffle.weekPeriod = _weekPeriod;
        newRaffle.startDate = _startDate;
        newRaffle.endDate = _endDate;
        newRaffle.isActive = true;

        emit RaffleCreated(currentRaffleId, _weekPeriod, _startDate, _endDate);
    }

    /**
     * @dev Adds tickets for a participant in the current raffle
     * Only callable by owner (backend integration)
     */
    function addTickets(
        address _participant,
        uint256 _ticketCount,
        bytes calldata _signature
    ) external onlyOwner {
        uint256 raffleId = currentRaffleId;
        require(raffles[raffleId].isActive, "No active raffle");
        require(block.timestamp <= raffles[raffleId].endDate, "Raffle ended");
        require(_ticketCount > 0, "Invalid ticket count");

        // Verify signature to ensure tickets come from validated engagement
        bytes32 messageHash = keccak256(abi.encodePacked(raffleId, _participant, _ticketCount));
        require(_verifySignature(messageHash, _signature), "Invalid signature");

        Participant storage participant = raffleParticipants[raffleId][_participant];
        
        if (!participant.hasParticipated) {
            participant.hasParticipated = true;
            participant.firstTicketNumber = raffles[raffleId].totalTickets + 1;
            raffleParticipantsList[raffleId].push(_participant);
            raffles[raffleId].totalParticipants++;
        }

        participant.ticketCount += _ticketCount;
        participant.lastTicketNumber = raffles[raffleId].totalTickets + _ticketCount;
        raffles[raffleId].totalTickets += _ticketCount;

        emit TicketsAdded(raffleId, _participant, _ticketCount);
    }

    /**
     * @dev Contributes $DEGEN to the current raffle pool
     */
    function contributeToPool(uint256 _amount, string memory _source) external {
        uint256 raffleId = currentRaffleId;
        require(raffles[raffleId].isActive, "No active raffle");
        require(_amount > 0, "Invalid amount");

        degenToken.safeTransferFrom(msg.sender, address(this), _amount);
        raffles[raffleId].totalPool += _amount;

        emit PoolContribution(raffleId, _amount, _source);
    }

    /**
     * @dev Executes the raffle and distributes prizes
     */
    function executeRaffle(uint256 _raffleId) external onlyOwner nonReentrant {
        Raffle storage raffle = raffles[_raffleId];
        require(raffle.isActive, "Raffle not active");
        require(block.timestamp > raffle.endDate, "Raffle not ended");
        require(!raffle.isCompleted, "Raffle already completed");
        require(raffle.totalParticipants >= 3, "Need at least 3 participants");

        // Generate random seed using blockhash and timestamp
        raffle.randomSeed = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            block.timestamp,
            block.difficulty,
            raffle.totalTickets
        )));

        // Calculate prize amounts
        raffle.firstPrize = (raffle.totalPool * FIRST_PLACE_PERCENTAGE) / 10000;
        raffle.secondPrize = (raffle.totalPool * SECOND_PLACE_PERCENTAGE) / 10000;
        raffle.thirdPrize = (raffle.totalPool * THIRD_PLACE_PERCENTAGE) / 10000;

        // Select winners
        (raffle.firstPlace, raffle.secondPlace, raffle.thirdPlace) = _selectWinners(_raffleId);

        // Distribute prizes
        if (raffle.firstPlace != address(0)) {
            degenToken.safeTransfer(raffle.firstPlace, raffle.firstPrize);
        }
        if (raffle.secondPlace != address(0)) {
            degenToken.safeTransfer(raffle.secondPlace, raffle.secondPrize);
        }
        if (raffle.thirdPlace != address(0)) {
            degenToken.safeTransfer(raffle.thirdPlace, raffle.thirdPrize);
        }

        raffle.isActive = false;
        raffle.isCompleted = true;

        emit RaffleCompleted(
            _raffleId,
            raffle.firstPlace,
            raffle.secondPlace,
            raffle.thirdPlace,
            raffle.firstPrize,
            raffle.secondPrize,
            raffle.thirdPrize
        );
    }

    /**
     * @dev Selects three unique winners using weighted random selection
     */
    function _selectWinners(uint256 _raffleId) internal view returns (address, address, address) {
        Raffle storage raffle = raffles[_raffleId];
        address[] memory participants = raffleParticipantsList[_raffleId];
        
        address firstPlace = _selectRandomWinner(_raffleId, 0);
        address secondPlace = _selectRandomWinner(_raffleId, 1);
        address thirdPlace = _selectRandomWinner(_raffleId, 2);

        // Ensure unique winners
        while (secondPlace == firstPlace && participants.length > 1) {
            secondPlace = _selectRandomWinner(_raffleId, uint256(keccak256(abi.encodePacked(secondPlace, block.timestamp))) % 1000);
        }
        
        while ((thirdPlace == firstPlace || thirdPlace == secondPlace) && participants.length > 2) {
            thirdPlace = _selectRandomWinner(_raffleId, uint256(keccak256(abi.encodePacked(thirdPlace, block.difficulty))) % 1000);
        }

        return (firstPlace, secondPlace, thirdPlace);
    }

    /**
     * @dev Selects a random winner based on ticket weight
     */
    function _selectRandomWinner(uint256 _raffleId, uint256 _nonce) internal view returns (address) {
        Raffle storage raffle = raffles[_raffleId];
        uint256 randomTicket = (uint256(keccak256(abi.encodePacked(raffle.randomSeed, _nonce))) % raffle.totalTickets) + 1;
        
        address[] memory participants = raffleParticipantsList[_raffleId];
        
        for (uint256 i = 0; i < participants.length; i++) {
            Participant memory participant = raffleParticipants[_raffleId][participants[i]];
            if (randomTicket >= participant.firstTicketNumber && randomTicket <= participant.lastTicketNumber) {
                return participants[i];
            }
        }
        
        return participants[0]; // Fallback
    }

    /**
     * @dev Verifies signature for ticket allocation
     */
    function _verifySignature(bytes32 _messageHash, bytes memory _signature) internal view returns (bool) {
        bytes32 ethSignedMessageHash = _messageHash.toEthSignedMessageHash();
        return ethSignedMessageHash.recover(_signature) == owner();
    }

    // View functions
    function getRaffle(uint256 _raffleId) external view returns (Raffle memory) {
        return raffles[_raffleId];
    }

    function getParticipant(uint256 _raffleId, address _participant) external view returns (Participant memory) {
        return raffleParticipants[_raffleId][_participant];
    }

    function getRaffleParticipants(uint256 _raffleId) external view returns (address[] memory) {
        return raffleParticipantsList[_raffleId];
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = degenToken.balanceOf(address(this));
        degenToken.safeTransfer(owner(), balance);
    }

    function pauseCurrentRaffle() external onlyOwner {
        raffles[currentRaffleId].isActive = false;
    }
}