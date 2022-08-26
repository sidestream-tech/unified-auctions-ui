import causeDebt from './scripts/causeDebt';
import resetFork from './scripts/resetFork';
import warpTime from './scripts/warpTime'
export const SIMULATIONS = [
    {
        title: 'create debt auction',
        steps: [
            {
                'title': 'Reset blockchain fork',
                'entry': resetFork
            },
            {
                'title': 'Create debt auction',
                'entry': causeDebt
            },
            {
                'title': 'Expire the auction',
                'entry': warpTime
            }
        ]
    },
    {
        title: 'Reset blockchin fork',
        steps: [
            {
                'title': 'Reset blockchain fork',
                'entry': resetFork
            },
        ]
    }
]
