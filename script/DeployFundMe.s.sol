// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {FundMe} from "../src/FundMe.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {MyToken} from "../src/MyToken.sol";

contract DeployFundMe is Script {
    uint256 public constant INITIAL_SUPPLY = 100 * 10 ** 18;

    function run() external returns (FundMe, HelperConfig, MyToken) {
        // not a "real" tx
        HelperConfig helperConfig = new HelperConfig();
        address ethUsdPriceFeed = helperConfig.activeNetworkConfig();

        // real tx
        vm.startBroadcast();
        FundMe fundMe = new FundMe(ethUsdPriceFeed);
        MyToken myToken = new MyToken(INITIAL_SUPPLY);
        vm.stopBroadcast();
        return (fundMe, helperConfig, myToken);
    }
}
