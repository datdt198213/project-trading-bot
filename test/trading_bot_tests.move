
#[test_only]
module trading_bot::trading_bot_tests {
    // uncomment this line to import the module
    use trading_bot::trading_bot;
    use std::debug;
    const ENotImplemented: u64 = 0;
    const Pool1_n2dr: u64 = 3201;
    const Pool2_usdt: u64 = 312;

    #[test]
    fun test_trading_bot() {
        
        let swap_amount: u64 = 495;
        let result = trading_bot::calculate_swap(Pool1_n2dr, Pool2_usdt, swap_amount);
        debug::print(&result);
        // print(&utf8(b"Functions in move"));
        // pass
    }

    #[test, expected_failure(abort_code = ENotImplemented)]
    fun test_trading_bot_fail() {
        abort ENotImplemented
    }
}

