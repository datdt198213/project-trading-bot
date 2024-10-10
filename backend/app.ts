import { Pool, SuiAddress } from "aftermath-ts-sdk";
import { Aftermath } from "aftermath-ts-sdk";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { CallbackQuery } from "node-telegram-bot-api";
import { Keypair } from "@mysten/sui/dist/cjs/cryptography";
import { bot_token } from "./config";
import { swapToken } from "./services/sui/aftermath";
import { createSuiWallet } from "./services/sui/utils";

import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { convertSuiToUSD } from "./services/sui/price";

import { url_catfish, suiscan_account } from "./config";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";


// create a new SuiClient object pointing to the network you want to use
const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') });

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(bot_token, { polling: true });

// Callback data for button event
enum TelegramCallbackData {
    BUY = 'buy',
    SELL = 'sell',
    BUY_FISH = 'buy_fish',
    WALLET = 'wallet',
    BACK_TO_MENU = 'back_to_menu',
    REFER_FRIENDS = 'generate_share_link',
}

// General Menu Buttons
const general_menu_buttons = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'Buy', callback_data: TelegramCallbackData.BUY },
                { text: 'Sell', callback_data: TelegramCallbackData.SELL }
            ],
            [
                { text: 'Buy $FISH', callback_data: TelegramCallbackData.BUY_FISH },
                { text: 'Visit CATFISH', url: url_catfish }
            ],
            [
                { text: 'Wallet', callback_data: TelegramCallbackData.WALLET },
                { text: 'Refer Friends', callback_data: TelegramCallbackData.REFER_FRIENDS }
            ],
        ]
    }
};

const wallet_menu_buttons = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'View on SuiScan', url: `${suiscan_account}/`}
            ],
            [
                { text: 'Back', callback_data: TelegramCallbackData.BACK_TO_MENU }
            ]
        ]
    }
};

const wallets: Record<string, string> = {};
var keypair: Ed25519Keypair;

bot.onText(/\/start/, async (msg: Message) => {
    const id = msg.chat.id;

    // create wallet for new user
    if (wallets[id] === undefined) {
        keypair = await createSuiWallet();
    } else {
        keypair = Ed25519Keypair.fromSecretKey(wallets[id]);
    }
    const walletAddress = keypair.toSuiAddress();
    const sui = await suiClient.getBalance({owner: keypair.toSuiAddress()})
    // Send welcome message with wallet address
    const suiToUSD = await convertSuiToUSD(Number(sui.totalBalance))
    
    if (sui.totalBalance === '0') {
        await bot.sendMessage(
            msg.chat.id,
            `<b>Welcome to FISH BOT.</b> \n\nYou currently have no SUI balance. Please deposit more funds to your FISH BOT wallet:\n\n<code>${walletAddress}</code> (Tap to copy)\n\nPower by CATFISH`, {parse_mode: "HTML"}
        );
    } else {
        await bot.sendMessage(
            msg.chat.id,
            `Sui's fastest bot to trade coins, and FISH BOT's official Telegram trading bot. \n\nYour current SUI balance is: <code>${sui.totalBalance} SUI</code> ($ ${suiToUSD})\n\nFISH BOT wallet: \n\n<code>${walletAddress} (Tap to copy)`, {parse_mode: "HTML"}
        );
    }

    // Send message with menu buttons
    await bot.sendMessage(
        msg.chat.id,
        "What do you want to do with the bot?",
        general_menu_buttons
    );
});

// Button events
bot.on("callback_query", async (callbackQuery: CallbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (message && data) {
        switch (data) {
            case TelegramCallbackData.BUY:
                await bot.sendMessage(message.chat.id, "API Token: xxxxxx");
                break;
            case TelegramCallbackData.SELL:
                await bot.sendMessage(message.chat.id, "Edit Bot options...");
                break;
            case TelegramCallbackData.BUY_FISH:
                await bot.sendMessage(message.chat.id, "Edit Bot options...");
                break;
            case TelegramCallbackData.WALLET:
                await bot.sendMessage(
                    message.chat.id,
                    "Bot Settings options...",
                );
                break;
            case TelegramCallbackData.REFER_FRIENDS:
                const userId = message.from?.id;
                const shareLink = `https://t.me/sui_fish_bot?start=ref_${userId}`;
                await bot.sendMessage(
                    message.chat.id,
                    `Referrals: \n\nYour reflink: ${shareLink} 
                    
                    Referrals: 1
                    
                    Pending Rewards: 0.00 SUI ($0.00)
                    Lifetime Earned: 0.00 SUI ($0.00)
                    
                    Refer a friend and earn 10% of their fees
                    `
                ); // Gửi lại liên kết chia sẻ
                break;
            default:
                await bot.sendMessage(message.chat.id, "Invalid action.");
                break;
        }

        // Answer with event action
        await bot.answerCallbackQuery(callbackQuery.id);
    }
});
