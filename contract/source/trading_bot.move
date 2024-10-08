
/// Module: trading_bot
module trading_bot::trading_bot {
    const E_NOTENOUGHT: u64 = 0;

    // This applies a 1% fee to each swap tx
    public fun calculate_swap(token1: u64, token2: u64, token1_swap: u64): u64 {
        assert!(token1_swap > 0, E_NOTENOUGHT);
        let fee: u64 = token1 * 1 / 100;
        let mix_supply: u64 = token1 * token2;
        let new_token1: u64 = token1 + token1_swap - fee;
        let new_token2: u64 = mix_supply / new_token1;
        let receive: u64 = token2 - new_token2;
        return receive
    }
}

