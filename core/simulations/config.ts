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
        title: 'Reset blockchin fork',
        steps: [
            {
                title: 'Reset blockchain fork',
                entry: resetFork,
            },
        ],
    },
];
