require('dotenv').config();
const axios = require('axios');
const db = require('./db');
const Discord = require('discord.js');
const client = new Discord.Client();
const etriz = '149615608466636801';

client.on('ready', () => {
  console.log(`Connected as ${client.user.tag}`);

  client.user.setActivity('for commands', { type: 'WATCHING' });

  client.guilds.cache.forEach((guild) => {
    console.log(`- to ${guild.name}`);
    // guild.channels.cache.forEach((channel) => {
    //   console.log(channel.name, channel.type, channel.id);
    // });
  });
  //   const devGeneral = ' 827965185217921049';
  const devTest = '828001725205577758';
  let generalChannel = client.channels.cache.get(devTest);
  //   generalChannel.send('Ready to Serve');
});

client.on('message', (message) => {
  if (message.author === client.user) return;
  if (message.content.startsWith('!!')) {
    processCommand(message);
  }
});

const processCommand = async (message) => {
  const fullCommand = message.content.substr(2);
  const splitCommand = fullCommand.split(' ');
  const primaryCommand = splitCommand[0];
  const arguments = splitCommand.slice(1);

  switch (primaryCommand.toLowerCase()) {
    case 'bug':
      if (arguments.length > 0) {
        const bug = await arguments.join(' ');
        etrizDM(bug);
        message.channel.send('Thanks for finding this bug');
      } else {
        message.channel.send('Please supply some details');
      }
      break;
    case 'help':
      helpCommand(arguments, message);
      break;
    case 'next':
      const next = await db.getCommandData('next');
      message.channel.send(`Next meeting is ${next}`);
      break;
    case 'addcommand':
      if (arguments.length === 0) {
        message.channel.send(`Try !!addcommand [command] [details]`);
      } else {
        if (arguments.length > 1) {
          const newCommand = arguments[0];
          const temp = arguments.slice(1);
          const details = await temp.join(' ');
          const addAttempt = await db.addNewCommand(newCommand, details);
          message.channel.send(`Added command !!${addAttempt}`);
        } else {
          message.channel.send('Please supply details');
        }
      }
      break;
    case 'set':
      if (arguments.length === 0) {
        message.channel.send(`Try !!set [command] [details]`);
      } else if (arguments[0].toLowerCase() === 'next') {
        if (arguments.length > 1) {
          let temp = arguments.slice(1);
          const next = temp.join(' ');
          const setAttempt = await db.setNext(next);
          // console.log(setAttempt);
          message.channel.send(`Next meeting has been set for ${setAttempt}`);
        } else {
          message.channel.send('Please supply details');
        }
      } else if (arguments[0].toLowerCase() === 'activity') {
        if (message.author.id === etriz) {
          client.user.setActivity(arguments.slice(2).join(' '), {
            type: arguments[1].toUpperCase(),
          });
        } else {
          message.channel.send('This is a owner only command');
        }
      }
      break;
    case 'bitcoin':
      bitCoinCommand(message);
      break;
    default:
      const commands = await db.defaultSelect();
      const primary = primaryCommand.toLowerCase();
      if (commands.includes(primary)) {
        // const data = await db.getCommandData(primary);
        // console.log(data);
        console.log('commands', commands);
        // message.channel.send('');
      } else {
        message.channel.send('Unrecognized command, please try again.');
      }
      break;
  }
};

const helpCommand = (arguments, message) => {
  arguments.length > 0
    ? message.channel.send(`It looks like you need help with ${arguments}`)
    : message.channel.send('The commands are: !!next, !!set next, !!bitcoin, !!bug');
};

const bitCoinCommand = async (message) => {
  const search = await message.channel.send('Searching ...');
  const res = await axios.get(
    'https://api.coingecko.com/api/v3/simple/price?ids=ethereum%2Cbitcoin&vs_currencies=usd'
  );
  const bitcoin = await res.data.bitcoin.usd;
  const eth = await res.data.ethereum.usd;
  if (bitcoin && eth) {
    search.delete();
    message.reply(
      `Bitcoin price: ${formatCurrency(bitcoin)}\nEthereum price: ${formatCurrency(eth)}`
    );
  }
};

const formatCurrency = (price) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
};

const etrizDM = (message) => {
  client.users.cache.get(etriz).send(message);
};

client.login(process.env.DISCORD_CLIENT_LOGIN);
