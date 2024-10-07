import dotenv from 'dotenv'
import { AftermathApi, ConfigAddresses, IndexerCaller } from 'aftermath-ts-sdk';
// import { SuiClient, SuiHTTPTransport } from '@mysten/sui/client';
import { Aftermath } from 'aftermath-ts-sdk';
import TelegramBot from 'node-telegram-bot-api';
dotenv.config();


// replace the value below with the Telegram token you receive from @BotFather
const token = '7942192381:AAEayr40RTBTAPQJltmPAl_z_Vf8BArQYJU';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

//   const chatId = msg.chat.id;
//   const resp = String(match[1]); // the captured "whatever"

  // send back the matched "whatever" to the chat
//   bot.sendMessage(chatId, resp);
});

// Matches "/echo [whatever]"
bot.onText(/\/data/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message
  
    const chatId = msg.chat.id;
    const message = String(msg.text);
    
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, message);
  });
  

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // send a message to the chat acknowledging receipt of their message
  bot.sendMessage(chatId, 'Received your message');
});


// Create protocol provider
// const router = afSdk.Router();
// const pools = afSdk.Pools();
// const staking = afSdk.Staking();
// const farms = afSdk.Farms();

// Aftermath API

const fullnodeEndpoint = "https://fullnode.mainnet.sui.io";

const addresses: ConfigAddresses = {pools : };
const afApi = new AftermathApi(
	new SuiClient({
		transport: new SuiHTTPTransport({
			url: fullnodeEndpoint,
		}),
	}),
	addresses,
	new IndexerCaller("MAINNET"), // "MAINNET" | "TESTNET" | "DEVNET"
);
const afSdk = new Aftermath("TESTNET")

// const afApi = new AftermathApi(
// 	new SuiClient({
// 		transport: new SuiHTTPTransport({
// 			url: fullnodeEndpoint,
// 		}),
// 	}),
// 	addresses,
// 	new IndexerCaller("MAINNET"), // "MAINNET" | "TESTNET" | "DEVNET"
// );

// console.log(afApi);

console.log("I am alive");