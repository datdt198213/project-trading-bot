import axios from 'axios';

// URL API của CoinGecko để lấy giá SUI
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd';

async function getSuiPriceInUSD() {
  try {
    const response = await axios.get(COINGECKO_API_URL);
    const suiPriceInUSD = response.data.sui.usd;
    
    return suiPriceInUSD;
  } catch (error) {
    console.error('Error get SUI price from CoinGecko:', error);
  }
}

// Hàm chuyển đổi số lượng SUI sang USD
export async function convertSuiToUSD(amountOfSui: number) {
  const suiPriceInUSD = await getSuiPriceInUSD();
  if (suiPriceInUSD) {
    const totalInUSD = amountOfSui * suiPriceInUSD;
    return totalInUSD;
  }
}

