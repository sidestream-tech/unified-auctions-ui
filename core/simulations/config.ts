import causeDebt from './scripts/causeDebt';
import resetFork from './scripts/resetFork';
import warpTime from './scripts/warpTime';
import increaseBalances from './scripts/addDaiAndMkrToWallet'

export const SIMULATIONS = [
    {
        title: 'create debt auction',
        steps: [
            {
                title: 'Reset blockchain fork',
                entry: async () => await resetFork(),
            },
            {
                title: 'Create debt auction',
                entry: async () => await causeDebt(),
            },
            {
                title: 'Add DAI and MKR to the wallet',
                entry: async () => await increaseBalances(),
            },
            {
                title: 'Expire the auction',
                entry: async () => await warpTime(),
            },
        ],
    },
    {
        title: 'Fork while WSTETH-A is running',
        steps: [
            {
                title: 'Reset blockchain fork',
                // Few blocks before WSTETH-A is taken at 14052147,
                // https://etherscan.io/address/0x49a33a28c4c7d9576ab28898f4c9ac7e52ea457at
                entry: async () => await resetFork(14052140),
            },
        ],
    },
];
