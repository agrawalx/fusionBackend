// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

contract EscrowSrc {
    address public maker;
    address public resolver;
    address public token;
    uint256 public amount;
    bytes32 public hashlock;
    uint256 public timelock;
    uint256 public finalitylock; 

    bool public isClaimed;
    bool public isRefunded;

    constructor(
        address _maker,
        address _resolver,
        address _token,
        uint256 _amount,
        bytes32 _hashlock,
        uint256 _timelock,
        uint256 _finalitylock
    ) payable {
        require(msg.value >= 1e15, "Safety deposit too low");
        maker = _maker;
        resolver = _resolver;
        token = _token;
        amount = _amount;
        hashlock = _hashlock;
        timelock =  _timelock;
        finalitylock = _finalitylock;

    }

    function TransferTokensToMaker(bytes calldata _secret) external {
        require(msg.sender == resolver, "Not resolver");
        require(!isClaimed && !isRefunded, "Already resolved");
        require(keccak256(_secret) == hashlock, "Invalid secret");
        require(block.timestamp < timelock, "Timelocked");
        require(block.timestamp >= finalitylock, "Finality lock active");

        isClaimed = true;
        IERC20(token).transfer(maker, amount);
        payable(resolver).transfer(address(this).balance);

    }

    function slash() external {
        require(block.timestamp >= timelock, "Timelock not expired");
        require(!isClaimed, "Already claimed");

        isClaimed = true;
        IERC20(token).transfer(maker, amount);
        payable(msg.sender).transfer(address(this).balance);
    }
}
