import dotenv from "dotenv";
import { Pool, SuiAddress } from "aftermath-ts-sdk";
import { Aftermath } from "aftermath-ts-sdk";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { CallbackQuery } from "node-telegram-bot-api";
import { Keypair } from "@mysten/sui/dist/cjs/cryptography";
import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";

dotenv.config();

// Function to create a SUI wallet
async function createSuiWallet(): Promise<Ed25519Keypair> {
    // Generate a new keypair
    return new Ed25519Keypair();
}

// replace the value below with the Telegram token you receive from @BotFather
const token = "7942192381:AAFfLnj8LefrADeK-gIToEQF2i6JWKDbFp8";

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

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

var keypair: Ed25519Keypair;

// Lắng nghe sự kiện khi thành viên mới tham gia
bot.on('new_chat_members', async (msg: Message) => {
    const newMembers = msg.new_chat_members;

    if (newMembers) {
        for (const member of newMembers) {
            const username = member.username || member.first_name || 'New user';

            // Tạo ví cho người dùng mới
            const keypair = await createSuiWallet();
            const walletAddress = keypair.toSuiAddress();

            // Gửi tin nhắn chào mừng và hiển thị địa chỉ ví
            await bot.sendMessage(msg.chat.id, `Welcome ${username}, your wallet is ${walletAddress}`);

            // Tạo bàn phím với các nút bấm
            const keyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: 'Buy', callback_data: 'buy' },
                            { text: 'Sell', callback_data: 'sell' }
                        ],
                        [
                            { text: 'Wallet', callback_data: 'wallet' },
                            { text: 'Refer Friends', callback_data: 'refer_friends' }
                        ],
                    ]
                }
            };

            // Gửi tin nhắn với các nút bấm
            await bot.sendMessage(msg.chat.id, 'What do you want to do with the bot?', keyboard);
        }
    }
});

// Lắng nghe sự kiện callback từ các nút bấm
bot.on('callback_query', async (callbackQuery: CallbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (message && data) {
        switch (data) {
            case 'buy':
                await bot.sendMessage(message.chat.id, 'API Token: xxxxxx');
                break;
            case 'sell':
                await bot.sendMessage(message.chat.id, 'Edit Bot options...');
                break;
            case 'wallet':
                await bot.sendMessage(message.chat.id, 'Bot Settings options...');
                break;
            case 'refer_friends':
                    // const shareLink = `https://t.me/${keypair.toSuiAddress()}?ref=${message.chat.id}`; // Tạo lại liên kết chia sẻ
                    const shareLink = `https://t.me/${message.chat.id}`
                    await bot.sendMessage(message.chat.id,`Here is your share link: ${shareLink}`); // Gửi lại liên kết chia sẻ
                break;
            default:
                await bot.sendMessage(message.chat.id, 'Invalid action.');
                break;
        }

        // Xác nhận callback query
        await bot.answerCallbackQuery(callbackQuery.id);
    }
});


// Lắng nghe sự kiện callback từ nút bấm
bot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.id;

    // Kiểm tra xem callback có phải là 'generate_share_link' không
    if (callbackQuery.data === "generate_share_link") {
        if (typeof keypair === "object" && typeof keypair.toSuiAddress === "function") {
            // Tạo lại liên kết chia sẻ
            const shareLink = `https://t.me/${keypair.toSuiAddress()}?ref=${chatId}`;
            // Gửi lại liên kết chia sẻ
            await bot.sendMessage(chatId,`Here is your share link: ${shareLink}`);
        } else {
            await bot.sendMessage(chatId,"Error: Unable to generate share link.");
        }

        // Xác nhận callback
        await bot.answerCallbackQuery(callbackQuery.id);
    }
});

const fullnodeEndpoint = "https://fullnode.mainnet.sui.io";
const pools = new Aftermath("MAINNET").Pools();
const router = new Aftermath("MAINNET").Router();

// Get the list pool name of Aftermath
async function getPoolNameList(): Promise<Array<string>> {
    const allPools: Pool[] = await pools.getAllPools();
    const poolNameList: Array<string> = [];
    for (const pool of allPools) {
        poolNameList.push(pool.pool.name);
    }
    return poolNameList;
}

function getCoinTypes(pool: Pool): Array<string> {
    return Object.keys(pool.pool.coins);
}

async function getPoolByPoolName(poolName: string): Promise<Pool | undefined> {
    const allPools = await pools.getAllPools();
    var poolObjectId: string = "";
    var pool = undefined;
    for (const pool of allPools) {
        if (pool.pool.name === poolName) {
            poolObjectId = pool.pool.objectId;
            break;
        }
    }
    if (poolObjectId !== "") {
        pool = await pools.getPool({ objectId: poolObjectId });
    }
    return pool;
}

const receipient: SuiAddress =
    "0x1e6f3aadf9cf6657a77fe60ae2ae77b71defcafc1543cb196061360e8e1ab9fe"; // Contract address
async function swapToken(poolName: string, coinInAmount: bigint) {
    const pool = await getPoolByPoolName(poolName);
    if (pool !== undefined) {
        const coinTypes = getCoinTypes(pool);
        const coinInType = coinTypes[0];
        const coinOutType = coinTypes[1];
        console.log(coinInType, coinOutType);

        const route = await router.getCompleteTradeRouteGivenAmountIn({
            coinInType: coinInType,
            coinOutType: coinOutType,
            coinInAmount: coinInAmount,

            // optional
            externalFee: {
                recipient: receipient,
                feePercentage: 0.01, // 1% fee from amount out
            },
        });

        const tx = await router.getTransactionForCompleteTradeRoute({
            walletAddress: receipient,
            completeRoute: route,
            slippage: 0.01, // 1% max slippage
        });

        console.log(tx);
    }
}

async function main() {
    const poolNameList: Array<string> = await getPoolNameList();
    // console.log(poolNameList);
    // await swapToken("My new poolt", BigInt(1_000_000_000));
    // const { keypair, publicKey } = await createSuiWallet();
    // const privateKey = String(process.env.BOT_PRIVATE_KEY);
    // const keypair = Ed25519Keypair.fromSecretKey(privateKey);
    // const address = keypair.getPublicKey().toSuiAddress();
    // console.log(address);
}

main();

console.log("I am alive");
