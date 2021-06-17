const hre = require('hardhat');
const { deployed } = require('./deployed');
const { getContract } = require('./getContract');

const NB_TOKEN = 100;

async function main() {
  const [deployer, reserve, owner] = await hre.ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  const tokenAddress = await getContract('Token', 'kovan');
  // We get the contract to deploy
  const Faucet = await hre.ethers.getContractFactory('Faucet');
  const faucet = await Faucet.deploy(tokenAddress, owner.address, NB_TOKEN);

  await faucet.deployed();

  await deployed('Faucet', hre.network.name, faucet.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
