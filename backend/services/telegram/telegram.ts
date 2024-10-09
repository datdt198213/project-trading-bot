// Callback data for button event
export enum TelegramCallbackData {
    BUY = 'buy',
    SELL = 'sell',
    BUY_FISH = 'buy_fish',
    VISIT_CAT_FISH = 'visit_cat_fish',
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
                { text: 'Buy $FISH', callback_data: TelegramCallbackData.BUY_FISH },
                { text: 'Visit CATFISH', callback_data: TelegramCallbackData.VISIT_CAT_FISH }
            ],
            [
                { text: 'Wallet', callback_data: TelegramCallbackData.WALLET },
                { text: 'Refer Friends', callback_data: TelegramCallbackData.REFER_FRIENDS }
            ],
        ]
    }
};