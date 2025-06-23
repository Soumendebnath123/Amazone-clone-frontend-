// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        string info;
        uint256 voteCount;
    }
    
    struct VotingSession {
        uint256 id;
        string title;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }

    address public admin;
    uint256 public candidatesCount;
    VotingSession public currentSession;
    
    mapping(uint256 => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public voterChoice;
    mapping(uint256 => mapping(address => bool)) public sessionVotes; // sessionId => voter => hasVoted
    
    event CandidateAdded(uint256 indexed id, string name, string info);
    event CandidateRemoved(uint256 indexed id);
    event VoteCast(address indexed voter, uint256 indexed candidateId);
    event SessionStarted(uint256 indexed sessionId, string title, uint256 startTime, uint256 endTime);
    event SessionEnded(uint256 indexed sessionId);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier sessionActive() {
        require(currentSession.isActive, "No active voting session");
        require(block.timestamp >= currentSession.startTime, "Session not started yet");
        require(block.timestamp <= currentSession.endTime, "Session has ended");
        _;
    }
    
    modifier hasNotVoted() {
        require(!sessionVotes[currentSession.id][msg.sender], "You have already voted in this session");
        _;
    }
    
    constructor() {
        admin = msg.sender;
        candidatesCount = 0;
    }
    
    function addCandidate(string memory _name, string memory _info) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _info, 0);
        emit CandidateAdded(candidatesCount, _name, _info);
    }
    
    function removeCandidate(uint256 _candidateId) public onlyAdmin {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(!currentSession.isActive, "Cannot remove candidate during active session");
        
        delete candidates[_candidateId];
        emit CandidateRemoved(_candidateId);
    }
    
    function startSession(string memory _title, uint256 _durationInMinutes) public onlyAdmin {
        require(!currentSession.isActive, "A session is already active");
        require(candidatesCount > 0, "No candidates available");
        
        uint256 sessionId = block.timestamp;
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + (_durationInMinutes * 60);
        
        currentSession = VotingSession(sessionId, _title, startTime, endTime, true);
        
        // Reset voting status for new session
        _resetVotingStatus();
        
        emit SessionStarted(sessionId, _title, startTime, endTime);
    }
    
    function endSession() public onlyAdmin {
        require(currentSession.isActive, "No active session to end");
        
        uint256 sessionId = currentSession.id;
        currentSession.isActive = false;
        
        emit SessionEnded(sessionId);
    }
    
    function vote(uint256 _candidateId) public sessionActive hasNotVoted {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(bytes(candidates[_candidateId].name).length > 0, "Candidate does not exist");
        
        sessionVotes[currentSession.id][msg.sender] = true;
        hasVoted[msg.sender] = true; // Keep for compatibility
        voterChoice[msg.sender] = _candidateId;
        candidates[_candidateId].voteCount++;
        
        emit VoteCast(msg.sender, _candidateId);
    }
    
    function getCandidate(uint256 _candidateId) public view returns (Candidate memory) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        return candidates[_candidateId];
    }
    
    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        uint256 currentIndex = 0;
        
        for (uint256 i = 1; i <= candidatesCount; i++) {
            if (bytes(candidates[i].name).length > 0) {
                allCandidates[currentIndex] = candidates[i];
                currentIndex++;
            }
        }
        
        // Resize array to actual count
        Candidate[] memory activeCandidates = new Candidate[](currentIndex);
        for (uint256 i = 0; i < currentIndex; i++) {
            activeCandidates[i] = allCandidates[i];
        }
        
        return activeCandidates;
    }
    
    function getTotalVotes() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 1; i <= candidatesCount; i++) {
            totalVotes += candidates[i].voteCount;
        }
        return totalVotes;
    }
    
    function getSessionStatus() public view returns (VotingSession memory) {
        return currentSession;
    }
    
    function userHasVoted(address _voter) public view returns (bool) {
        if (!currentSession.isActive) return false;
        return sessionVotes[currentSession.id][_voter];
    }
    
    function getUserVote(address _voter) public view returns (uint256) {
        require(hasVoted[_voter], "User has not voted");
        return voterChoice[_voter];
    }
    
    function isSessionActive() public view returns (bool) {
        if (!currentSession.isActive) return false;
        if (block.timestamp < currentSession.startTime) return false;
        if (block.timestamp > currentSession.endTime) return false;
        return true;
    }
    
    function getTimeRemaining() public view returns (uint256) {
        if (!isSessionActive()) return 0;
        if (block.timestamp >= currentSession.endTime) return 0;
        return currentSession.endTime - block.timestamp;
    }
    
    function _resetVotingStatus() private {
        // Reset candidate vote counts for new session
        for (uint256 i = 1; i <= candidatesCount; i++) {
            candidates[i].voteCount = 0;
        }
        // Note: sessionVotes mapping automatically isolates votes per session
    }
    
    function transferAdmin(address _newAdmin) public onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        admin = _newAdmin;
    }
}