const hre = require('hardhat');
const { deployed } = require('./deployed');

const INIT_SUPPLY = ethers.utils.parseEther('1000000');

async function main() {
  const [deployer, reserve, owner] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);
  // We get the contract to deploy
  const Token = await hre.ethers.getContractFactory('Token');
  const token = await Token.deploy(reserve.address, INIT_SUPPLY);

  await token.deployed();

  await deployed('Token', hre.network.name, token.address);
  await token.connect(reserve).approve(owner.address, INIT_SUPPLY);
  // console.log((await token.allowance(reserve.address, owner.address)).toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
