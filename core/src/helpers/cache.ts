import memoizee from 'memoizee';
const IS_TEST = !!process.env.IS_TEST

interface StubbedMemoized {
    clear: Function;
}
function cache<F extends (...args: any[]) => any>(f: F, params: Record<string, any>) : F & memoizee.Memoized<F> | F & StubbedMemoized {
    if (IS_TEST) {
        const ret = f as F &StubbedMemoized
        ret.clear = () => ({})
        return ret
    }
    return memoizee(f, params)
}


export default cache;
