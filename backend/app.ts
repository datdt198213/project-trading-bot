import { Pool, SuiAddress } from "aftermath-ts-sdk";
import { Aftermath } from "aftermath-ts-sdk";
import TelegramBot, { Message } from "node-telegram-bot-api";
import { CallbackQuery } from "node-telegram-bot-api";
import { Keypair } from "@mysten/sui/dist/cjs/cryptography";
import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { bot_token } from "./config";
import { swapToken } from "./services/contract/contract";
import {
    general_menu_buttons,
    TelegramCallbackData,
} from "./services/telegram/telegram";

// Function to create a SUI wallet
async function createSuiWallet(): Promise<Ed25519Keypair> {
    // Generate a new keypair
    return new Ed25519Keypair();
}

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(bot_token, { polling: true });

bot.onText(/\/start/, async (msg: Message) => {
    // create wallet for new members
    const keypair = await createSuiWallet();
    const walletAddress = keypair.toSuiAddress();

    // Send welcome message with wallet address
    await bot.sendMessage(
        msg.chat.id,
        `Welcome FISH BOT, your wallet is ${walletAddress}`
    );

    // Send message with menu buttons
    await bot.sendMessage(
        msg.chat.id,
        "What do you want to do with the bot?",
        general_menu_buttons
    );
});

// New chat members
bot.on("new_chat_members", async (msg: Message) => {
    const newMembers = msg.new_chat_members;

    if (newMembers) {
        for (const member of newMembers) {
            const username = member.username || member.first_name || "New user";

            // create wallet for new members
            const keypair = await createSuiWallet();
            const walletAddress = keypair.toSuiAddress();

            // Send welcome message with wallet address
            await bot.sendMessage(
                msg.chat.id,
                `Welcome FISH BOT, your wallet is ${walletAddress}`
            );

            // Send message with menu buttons
            await bot.sendMessage(
                msg.chat.id,
                "What do you want to do with the bot?",
                general_menu_buttons
            );
        }
    }
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
            case TelegramCallbackData.VISIT_CAT_FISH:
                await bot.sendMessage(message.chat.id, "Edit Bot options...");
                break;
            case TelegramCallbackData.WALLET:
                await bot.sendMessage(
                    message.chat.id,
                    "Bot Settings options..."
                );
                break;
            case TelegramCallbackData.REFER_FRIENDS:
                const userId = message.from?.id;
                const shareLink = `https://t.me/sui_fish_bot?start=ref_${userId}`;
                await bot.sendMessage(
                    message.chat.id,
                    `Here is your share link: ${shareLink}. Send it to your friend to earn token gift.`
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
