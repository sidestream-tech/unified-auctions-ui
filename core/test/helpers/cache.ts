import { Memoized } from 'memoizee';

export default (cachedFunctions: Memoized<Function>[]) => {
    for (const fun of cachedFunctions) {
        fun.clear();
    }
};
