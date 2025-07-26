// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./EscrowSrc.sol";

contract EscrowFactory {
    address public owner;
    uint256 public constant MIN_SAFETY_DEPOSIT = 1e15;
    event EscrowCreated(address escrowAddress);

    constructor() {
        owner = msg.sender;
    }

    function createEscrow(
        address token,
        address maker,
        address resolver,
        uint256 amount,
        bytes32 secretHash,
        uint256 timelock,
        uint256 finalitylock
    ) external payable returns (address) {
        // Transfer tokens from maker to the new escrow contract
        require(msg.value >= MIN_SAFETY_DEPOSIT, "Insufficient safety deposit");
        EscrowSrc escrow = new EscrowSrc{value: msg.value}(
            token,
            maker,
            resolver,
            amount,
            secretHash,
            block.timestamp + timelock,
            block.timestamp + finalitylock
        );

        require(
            IERC20(token).transferFrom(maker, address(escrow), amount),
            "Token transfer failed"
        );

        emit EscrowCreated(address(escrow));
        return address(escrow);
    }
}
