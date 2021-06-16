// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./Token.sol";

/// @title Faucet
/// @author Solène PETTIER
/// @notice Each 3 days, a user can ask for 100 TKN
/// @dev This Faucet connects to a ERC20 contract
contract Faucet is Ownable {
    using Address for address payable;
    // State variables
    Token private _token;
    address private _reserve;
    mapping(address => uint256) private _lastSend;
    uint256 private _nbToken;

    // Events
    event Sent(address indexed sender);

    // constructor
    constructor(
        address tokenAddress,
        address owner_,
        uint256 nbToken_
    ) {
        _token = Token(tokenAddress);
        _reserve = _token.reserve();
        transferOwnership(owner_);
        _nbToken = nbToken_;
    }

    // modifiers
    modifier notOwner() {
        require(owner() != msg.sender, "Faucet : owner can not use this function");
        _;
    }
    modifier wait3days() {
        require(_lastSend[msg.sender] + 3 * 1 days < block.timestamp, "Faucet : have to wait 3 days to ask again");
        _;
    }

    // functions
    /// @notice Allow users to get tokens
    /// @dev Function calls private _askToken function
    function askToken() public {
        _askToken(msg.sender);
    }

    /// @notice Private function called throught askToken function
    /// @dev Private function called throught askToken function
    /// @param sender the one that calls the function
    function _askToken(address sender) private notOwner wait3days {
        uint256 reserveBalance = _token.balanceOf(_reserve);
        require(_nbToken <= reserveBalance, "Faucet : do not have enought tokens to give");
        _lastSend[sender] = block.timestamp;
        _token.transferFrom(_reserve, sender, _nbToken);
        emit Sent(sender);
    }

    // getters
    /// @notice Allow user to get Token address
    /// @dev Function is a getter to return Token address
    /// @return _token Token
    function token() public view returns (Token) {
        return _token;
    }

    /// @notice Allow user to get reserve address
    /// @dev Function is a getter to return reserve address
    /// @return _reserve address
    function reserve() public view returns (address) {
        return _reserve;
    }

    /// @notice Allow user to get the date they last ask
    /// @dev Function is a getter to return timestamp of last transaction
    /// @return _lastSend of an account
    function lastSend(address account) public view returns (uint256) {
        return _lastSend[account];
    }

    /// @notice Allow user to get fixed nb of token sent per transaction
    /// @dev Function is a getter to return _nbToken
    /// @return _nbToken set in constructor
    function nbToken() public view returns (uint256) {
        return _nbToken;
    }
}
