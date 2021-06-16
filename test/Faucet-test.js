/* eslint-disable comma-dangle */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Faucet', async function () {
  let Token, token, Faucet, faucet, dev, reserve, owner, alice, bob;

  const INIT_SUPPLY = 10 ** 9;
  const NB_TKN = 100;

  beforeEach(async function () {
    [dev, reserve, owner, alice, bob] = await ethers.getSigners();
    Token = await ethers.getContractFactory('Token');
    token = await Token.connect(dev).deploy(reserve.address, INIT_SUPPLY);
    await token.deployed();
    Faucet = await ethers.getContractFactory('Faucet');
    faucet = await Faucet.connect(dev).deploy(token.address, owner.address, NB_TKN);
    await faucet.deployed();
  });

  describe('Deployment', async function () {
    it(`Should have token address set`, async function () {
      expect(await faucet.token()).to.equal(token.address);
    });
    it(`Should have reserve set`, async function () {
      expect(await faucet.reserve()).to.equal(await token.reserve());
    });
    it(`Should have owner set`, async function () {
      expect(await faucet.owner()).to.equal(owner.address);
    });
    it(`Should have _nbToken ${NB_TKN}`, async function () {
      expect(await faucet.nbToken()).to.equal(NB_TKN);
    });
  });

  describe('askToken', async function () {
    beforeEach(async function () {
      await token.connect(reserve).approve(faucet.address, INIT_SUPPLY);
      //await ethers.provider.send('evm_increaseTime', [259200]);
      //await ethers.provider.send('evm_mine');
    });
    it('Should revert if owner', async function () {
      await expect(faucet.connect(owner).askToken()).to.be.revertedWith('Faucet : owner can not use this function');
    });
    it('Should revert did not wait 3 days', async function () {
      await faucet.connect(alice).askToken();
      await expect(faucet.connect(alice).askToken()).to.be.revertedWith('Faucet : have to wait 3 days to ask again');
    });
    it('Should revert if not enought in reserve', async function () {
      await token.connect(reserve).transfer(bob.address, INIT_SUPPLY);
      await expect(faucet.connect(alice).askToken()).to.be.revertedWith('Faucet : do not have enought tokens to give');
    });
    it('Should set _lastSend with actual timestamp', async function () {
      await faucet.connect(alice).askToken();
      const blockNumber = await ethers.provider.getBlockNumber();
      const block = await ethers.provider.getBlock(blockNumber);
      const blockTimestamp = block.timestamp;
      expect(await faucet.lastSend(alice.address)).to.equal(blockTimestamp);
    });
    it('Should change balances', async function () {
      await faucet.connect(alice).askToken();
      expect(await token.balanceOf(alice.address)).to.equal(NB_TKN);
      expect(await token.balanceOf(reserve.address)).to.equal(INIT_SUPPLY - NB_TKN);
    });
    it('Should emit Sent event', async function () {
      await expect(faucet.connect(alice).askToken()).to.emit(faucet, 'Sent').withArgs(alice.address);
    });
  });
});
