const hre = require('hardhat');
const { deployed } = require('./deployed');
const { getContract } = require('./getContract');
const { postDeployed } = require('./postDeployed');

const NB_TOKEN = 100;

async function main() {
  const [deployer, reserve, owner] = await ethers.getSigners();
  const token = await getContract('Token', 'kovan');
  console.log('Deploying contracts with the account:', deployer.address);

  // We get the contract to deploy
  const Faucet = await hre.ethers.getContractFactory('Faucet');
  const faucet = await Faucet.deploy(token.address, owner.address, NB_TOKEN);

  await faucet.deployed();

  await deployed('Faucet', hre.network.name, faucet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
