const hre = require('hardhat');
const { getContract } = require('./getContract');

const INIT_SUPPLY = hre.ethers.utils.parseEther('1000000');

const postDeployed = async () => {
  const [deployer, reserve, owner] = await hre.ethers.getSigners();

  const tokenAddress = await getContract('Token', 'kovan');
  const faucetAddress = await getContract('Faucet', 'kovan');

  const Token = await hre.ethers.getContractFactory('Token');
  const token = await Token.attach(tokenAddress);
  await token.connect(reserve).approve(faucetAddress, INIT_SUPPLY);
  /*
  const allowance = await token.allowance(reserve.address, faucetAddress);
  console.log(allowance.toString());
  */
};

postDeployed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
