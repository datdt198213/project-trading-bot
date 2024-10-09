import { Pool, SuiAddress } from "aftermath-ts-sdk";
import { Aftermath } from "aftermath-ts-sdk";
// import TelegramBot, { Message } from "node-telegram-bot-api";
// import { CallbackQuery } from "node-telegram-bot-api";
// import { Keypair } from "@mysten/sui/dist/cjs/cryptography";
// import { Ed25519Keypair, Ed25519PublicKey } from "@mysten/sui/keypairs/ed25519";
import { bot_token } from "../../config";

const fullnodeEndpoint = "https://fullnode.mainnet.sui.io";
const pools = new Aftermath("MAINNET").Pools();
const router = new Aftermath("MAINNET").Router();

// Get the list pool name of Aftermath
export async function getPoolNameList(): Promise<Array<string>> {
    const allPools: Pool[] = await pools.getAllPools();
    const poolNameList: Array<string> = [];
    for (const pool of allPools) {
        poolNameList.push(pool.pool.name);
    }
    return poolNameList;
}

export function getCoinTypes(pool: Pool): Array<string> {
    return Object.keys(pool.pool.coins);
}

export async function getPoolByPoolName(poolName: string): Promise<Pool | undefined> {
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
export async function swapToken(poolName: string, coinInAmount: bigint) {
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
    console.log(bot_token)
    // const poolNameList: Array<string> = await getPoolNameList();
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
