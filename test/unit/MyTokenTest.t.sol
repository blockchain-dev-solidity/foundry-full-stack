// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {MyToken} from "../../src/MyToken.sol";
import {DeployFundMe} from "../../script/DeployFundMe.s.sol";

contract MyTokenTest is Test {
    MyToken public myToken;
    DeployFundMe public deployer;

    address alice = makeAddr("alice");
    address bob = makeAddr("bob");
    address carl = makeAddr("carl");
    uint256 public constant STARTING_BALANCE = 10 ether;

    function setUp() public {
        deployer = new DeployFundMe();
        (, , myToken) = deployer.run();

        vm.prank(msg.sender);
        myToken.transfer(bob, STARTING_BALANCE);
    }

    function testBobBalance() public view {
        assertEq(STARTING_BALANCE, myToken.balanceOf(bob));
    }

    function testAllowancesWorks() public {
        uint256 initialAllowance = 1000;
        uint256 transferAmount = 500;

        vm.prank(bob);
        myToken.approve(alice, initialAllowance);

        vm.prank(alice);
        myToken.transferFrom(bob, alice, transferAmount);

        assertEq(myToken.balanceOf(alice), transferAmount);
        assertEq(myToken.balanceOf(bob), STARTING_BALANCE - transferAmount);
    }

    function testTransferBetweenUsers() public {
        uint256 transferAmount = 0.5 ether;

        vm.prank(bob);
        myToken.transfer(alice, transferAmount);

        assertEq(myToken.balanceOf(alice), transferAmount);
        assertEq(myToken.balanceOf(bob), STARTING_BALANCE - transferAmount);
    }

    function testApproveAndTransferFrom() public {
        uint256 approveAmount = 0.5 ether;
        uint256 transferAmount = 0.3 ether;

        vm.prank(bob);
        myToken.approve(alice, approveAmount);

        vm.prank(alice);
        myToken.transferFrom(bob, carl, transferAmount);

        assertEq(myToken.balanceOf(carl), transferAmount);
        assertEq(myToken.balanceOf(bob), STARTING_BALANCE - transferAmount);
        assertEq(myToken.allowance(bob, alice), approveAmount - transferAmount);
    }

    function testMintingTokens() public {
        uint256 mintAmount = 1000;

        uint256 initialTotalSupply = myToken.totalSupply();

        vm.prank(msg.sender);
        myToken.mint(alice, mintAmount);

        assertEq(myToken.balanceOf(alice), mintAmount);
        assertEq(myToken.totalSupply(), initialTotalSupply + mintAmount);
    }

    function testBurningTokens() public {
        uint256 burnAmount = 500;

        uint256 initialTotalSupply = myToken.totalSupply();

        vm.prank(bob);
        myToken.burn(burnAmount);

        assertEq(myToken.balanceOf(bob), STARTING_BALANCE - burnAmount);
        assertEq(myToken.totalSupply(), initialTotalSupply - burnAmount);
    }
}
