// Callback data for button event
export enum TelegramCallbackData {
    BUY = 'buy',
    SELL = 'sell',
    WALLET = 'wallet',
    REFER_FRIENDS = 'generate_share_link',
}

// General Menu Buttons
export const general_menu_buttons = {
    reply_markup: {
        inline_keyboard: [
            [
                { text: 'Buy', callback_data: TelegramCallbackData.BUY },
                { text: 'Sell', callback_data: TelegramCallbackData.SELL }
            ],
            [
                { text: 'Wallet', callback_data: TelegramCallbackData.WALLET },
                { text: 'Refer Friends', callback_data: TelegramCallbackData.REFER_FRIENDS }
            ],
        ]
    }
};