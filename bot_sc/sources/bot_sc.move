
/// Module: bot_sc
module bot_sc::bot_sc {
    use sui::sui::SUI;
    use sui::coin::Coin;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::balance::{Self, Balance};
    
    
     // Error codes
    const NOT_ENOUGH_SUI: u64 = 0;

    public struct BotOwnerCap has key { id: UID }
    
    public struct  BotWallet has key, store {
            id: UID, 
            balance: Balance<SUI>
    }

   
     fun init(ctx: &mut TxContext) {
        transfer::transfer(BotOwnerCap {
            id: object::new(ctx)
        }, ctx.sender());
        let bot_wallet = BotWallet {
            id: object::new(ctx),
            balance: balance::zero<SUI>()
        };
        transfer::share_object(bot_wallet);
    }

    // user deposit 100% token to contract
    public fun deposit(bot_wallet: &mut BotWallet, amount: Coin<SUI>, ctx: &mut TxContext){
        assert!(amount.value() > 0, 2);
        bot_wallet.balance.join(amount.into_balance());
    }

    // distribute token to 3 accounts 
    public fun distribute(
        bot_wallet: &mut BotWallet, 
        _: &BotOwnerCap, 
        treasury: address, 
        burn_wallet: address, 
        ref_wallet: address,
        ctx: &mut TxContext) 
    {
        let total_balance: u64 = bot_wallet.balance.value();
        assert(total_balance >= 1000, NOT_ENOUGH_SUI);
          // Tính toán số tiền sẽ chuyển cho mỗi tài khoản
        let amount_65percent = total_balance * 65 / 100;
        let amount_25percent = total_balance * 25 / 100;
        let amount_10percent = total_balance * 10 / 100;

        let coin_65percent = bot_wallet.balance.split(amount_65percent).into_coin(ctx);
        let coin_25percent = bot_wallet.balance.split(amount_25percent).into_coin(ctx);
        let coin_10percent = bot_wallet.balance.split(amount_10percent).into_coin(ctx);

        transfer::public_transfer(coin_65percent, treasury);
        transfer::public_transfer(coin_25percent, burn_wallet);
        transfer::public_transfer(coin_10percent, ref_wallet);

    }

}

