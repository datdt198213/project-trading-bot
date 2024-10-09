
#[test_only]
module bot_sc::bot_sc_tests {
    use sui::sui::SUI;
    use sui::coin::{Self, Coin};
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
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }

    #[test_only] use sui::test_scenario;
    #[test_only] use sui::test_utils;

    #[test]
    fun test_module_init() {
       

        let admin = @0xAD;
        let user = @0x4 ; 

        // 1st txL emualte module initialization
        let mut scenario = test_scenario::begin(admin);
        {
           init_for_testing(scenario.ctx());
        };
        // 2nd tx to check if the BotWallet has been created
        scenario.next_tx(user);
        {
            //extract the BotWallet object
            let mut bot_wallet = scenario.take_shared<BotWallet>();
           

            let balance = bot_wallet.balance.value();
            assert!(balance == 0, 0);
            test_scenario::return_shared(bot_wallet);


        };

        scenario.end();
    }
     #[test]
    fun test_deposit_to_bot () {
   
        let user = @0x1;
        let ctx = &mut tx_context::dummy();
        let mut bot_wallet = BotWallet {
            id : object::new(ctx),
            balance: balance::zero<SUI>()
        };
        let mut scenario = test_scenario::begin(user);
        {
         
            let coin = coin::mint_for_testing<SUI>(10_000_000_000, ctx);
            bot_wallet.deposit(coin, ctx);
            let balance = bot_wallet.balance.value();
            assert!(balance == 10_000_000_000, 0);

            let dummy_address = @0xCAFE;
            transfer::public_transfer(bot_wallet, dummy_address);

        };     
        scenario.end();
    }

    #[test]
    fun test_distribute () {
        let admin = @0xAD;
        let user = @0x4 ; 
        let (treasury , burn ,ref ) = (@0x1, @0x2, @0x3);

        let mut scenario = test_scenario::begin(admin);
        {
           init_for_testing(scenario.ctx());
        };
        // 2nd tx to check if the BotWallet has been created
        scenario.next_tx( user);
        {
            //extract the BotWallet object
            let mut bot_wallet = scenario.take_shared<BotWallet>();
            let ctx = scenario.ctx();
            let coin = coin::mint_for_testing<SUI>(10_000_000_000, ctx);
            bot_wallet.deposit(coin, ctx);
            let balance = bot_wallet.balance.value();
            assert!(balance ==  10_000_000_000 , 0);
            test_scenario::return_shared(bot_wallet);

        };
        // 3rd tx to distribute token to 3 wallets 
        scenario.next_tx( admin);
        {
            let mut bot_wallet = scenario.take_shared<BotWallet>();
            let cap = scenario.take_from_sender<BotOwnerCap>();
            let ctx = scenario.ctx();

            
            bot_wallet.distribute(&cap,  treasury, burn, ref, ctx);
            let balance = bot_wallet.balance.value();
            assert!(balance ==  0 , 0);
            transfer::transfer(cap, admin);
            test_scenario::return_shared(bot_wallet);

        };
        // assert SUI sent to 3 wallet 
        scenario.next_tx(treasury);
        {
            let coin1 = scenario.take_from_sender<Coin<SUI>>();
            assert!(coin1.value() == 6_500_000_000);
            test_utils::destroy(coin1);

        };
        scenario.next_tx(burn);
        {
            let coin1 = scenario.take_from_sender<Coin<SUI>>();
            assert!(coin1.value() == 2_500_000_000);
            test_utils::destroy(coin1);

        };
        scenario.next_tx(ref);
        {
            let coin1 = scenario.take_from_sender<Coin<SUI>>();
            assert!(coin1.value() == 1_000_000_000);
            test_utils::destroy(coin1);

        };
        scenario.end();
    }

    #[test]
    #[expected_failure]
    fun only_bot_owner_can_not_call_distribute () {
        let admin = @0xAD;
        let user = @0x4 ; 
        let (treasury , burn ,ref ) = (@0x1, @0x2, @0x3);

         let mut scenario = test_scenario::begin(admin);
        {
           init_for_testing(scenario.ctx());
        };
        // 2nd tx to check if the BotWallet has been created
        scenario.next_tx( user);
        {
            //extract the BotWallet object
            let mut bot_wallet = scenario.take_shared<BotWallet>();
            let ctx = scenario.ctx();
            let coin = coin::mint_for_testing<SUI>(10_000_000_000, ctx);
            bot_wallet.deposit(coin, ctx);
            let balance = bot_wallet.balance.value();
            assert!(balance ==  10_000_000_000 , 0);
            test_scenario::return_shared(bot_wallet);

        };
        // 3rd tx to distribute token to 3 wallets 
        scenario.next_tx( user);
        {
            let mut bot_wallet = scenario.take_shared<BotWallet>();
            let cap = scenario.take_from_sender<BotOwnerCap>();
            let ctx = scenario.ctx();

            
            bot_wallet.distribute(&cap,  treasury, burn, ref, ctx);
            let balance = bot_wallet.balance.value();
            assert!(balance ==  0 , 0);
            transfer::transfer(cap, admin);
            test_scenario::return_shared(bot_wallet);

        };
        scenario.end();

    }



}   

