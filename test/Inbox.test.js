const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const  {interface,bytecode} = require('../compile');

let accounts;
let inbox;

beforeEach(async() => {
  //get a list of all accounts
  // web3.eth.getAccounts()
  //   .then(fetchedAccounts => {
  //     console.log(fetchedAccounts);
  //   });

  //async approach
  accounts = await web3.eth.getAccounts();

  //use one of those accounts to deploy the contract
  //new web3.eth.Contract(JSON.parse(interface)) solidity compiler passes interface (ABI) as raw json,
  //which is parsed and passed to Contract as a json object.
  inbox = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ 
      data: bytecode,
      arguments: ['Hello world'] })
    .send({ from: accounts[0], gas: '1000000' });

  inbox.setProvider(provider);
});

describe('Inbox', () => {
  //make sure our contract was deployed by checking for an address
  it('deploys a contract', () => {
    console.log(inbox.options.address);
    assert.ok(inbox.options.address); //not null or undefined
  });

  //call the message method to make sure we get the same val we initialized to
  it('has a default message', async() => {
    const message = await inbox.methods.message().call();
    assert.equal(message, 'Hello world');
  });

  if('can change the message', async() => {
    await inbox.methods.setMessage('Hello 2').send({ from: accounts[0] });

    const message = await inbox.methods.message().call();
    assert.equal(message, 'Hello 2');

  });

});
