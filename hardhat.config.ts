import * as dotenv from "dotenv";

import { HardhatUserConfig, } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";

const config: HardhatUserConfig = {
  solidity: "0.8.12"
};

export default config;
