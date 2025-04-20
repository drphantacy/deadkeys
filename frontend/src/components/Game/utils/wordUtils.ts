const usedWords: string[] = [];
let wordLibrary: string[] = [];

// Generate 80 random crypto-related words from a pool of 200 words
export const initializeWordLibrary = () => {
    const cryptoWords = [
        'bitcoin', 'ethereum', 'blockchain', 'wallet', 'mining', 'token', 'altcoin', 'ledger', 'hash', 'smart contract',
        'decentralized', 'crypto', 'fiat', 'exchange', 'staking', 'gas', 'nft', 'defi', 'hodl', 'fomo',
        'whale', 'airdrop', 'fork', 'dapp', 'metaverse', 'dao', 'stablecoin', 'yield', 'liquidity', 'protocol',
        'scalability', 'consensus', 'validator', 'sharding', 'proof', 'stake', 'work', 'burn', 'satoshi', 'halving',
        'faucet', 'rug pull', 'pump', 'dump', 'moon', 'bear', 'bull', 'market', 'arbitrage', 'fiat gateway',
        'cold wallet', 'hot wallet', 'seed phrase', 'private key', 'public key', 'address', 'transaction', 'block', 'chain',
        'node', 'miner', 'reward', 'fees', 'hash rate', 'difficulty', 'confirmation', 'air gap', 'lightning', 'network',
        'scam', 'security', 'kyc', 'aml', 'compliance', 'custody', 'non-custodial', 'governance', 'utility', 'privacy',
        'anonymity', 'fungible', 'non-fungible', 'tokenomics', 'ico', 'ieo', 'ido', 'staking pool', 'liquidity pool', 'swap',
        'bridge', 'oracle', 'synthetics', 'derivatives', 'margin', 'leverage', 'short', 'long', 'position', 'volatility',
        'cryptography', 'decryption', 'encryption', 'block height', 'genesis block', 'hash function', 'merkle', 'timestamp',
        'utxo', 'segwit', 'light client', 'full node', 'peer', 'p2p', 'double-spend', 'immutability', 'trustless', 'permissionless',
        'hyperledger', 'crypto jacking', 'hash power', 'difficulty adjustment', 'block reward', 'halving event', 'dust', 'gas limit',
        'gas price', 'consensus mechanism', 'proof-of-work', 'proof-of-stake', 'delegated', 'byzantine', 'fault tolerance', 'shard',
        'rollup', 'zk-snark', 'zk-rollup', 'optimistic rollup', 'layer 2', 'sidechain', 'mainnet', 'testnet', 'airdrop campaign',
        'token burn', 'token minting', 'whitelist', 'pre-sale', 'crowdsale', 'vesting', 'lockup', 'airdrop snapshot', 'governance token',
        'utility token', 'security token', 'stable token', 'synthetic token', 'wrapped token', 'cross-chain', 'interoperability',
        'atomic', 'swap protocol', 'liquidity mining', 'impermanent loss', 'yield farming', 'flash loan', 'flash swap', 'collateral',
        'margin trading', 'leveraged trading', 'short selling', 'long position', 'stop loss', 'take profit', 'order book', 'market order',
        'limit order', 'slippage', 'spread', 'arbitrage opportunity', 'volatility index', 'fear and greed index', 'market cap', 'circulating supply',
        'total supply', 'max supply', 'inflation rate', 'deflationary', 'burn mechanism', 'minting mechanism', 'staking rewards', 'validator rewards'
    ];

    // Shuffle and pick 80 random words
    wordLibrary = cryptoWords.sort(() => Math.random() - 0.5).slice(0, 80);
};

export const generateUniqueWord = () => {
    const availableWords = wordLibrary.filter((word) => !usedWords.includes(word));
    if (availableWords.length === 0) return null; // No more unique words available
    const newWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    usedWords.push(newWord);
    return newWord;
};

export const resetUsedWords = () => {
    usedWords.length = 0; // Clear the array
};
