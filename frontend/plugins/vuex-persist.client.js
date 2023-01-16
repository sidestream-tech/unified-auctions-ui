import VuexPersistence from 'vuex-persist';
import Cookies from 'js-cookie';

export default ({ store }) => {
    window.onNuxtReady(async () => {
        new VuexPersistence({
            storage: window.localStorage,
            modules: ['preferences'],
        }).plugin(store);
        new VuexPersistence({
            storage: {
                getItem: key => Cookies.get(key),
                setItem: (key, value) => Cookies.set(key, value),
            },
            modules: ['cookies'],
        }).plugin(store);
        await store.dispatch('network/setup');
        store.dispatch('wallet/autoConnect');
    });
};
