import { Memoized } from 'memoizee';

export default (cachedFunctions: Memoized<any>[]) => {
    for (const fun of cachedFunctions) {
        fun.clear();
    }
};
