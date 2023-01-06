import VuexPersistence from 'vuex-persist';
import Cookies from 'js-cookie';

export default ({ store, isDev }) => {
    window.onNuxtReady(() => {
        new VuexPersistence({
            storage: window.localStorage,
            modules: ['network', 'preferences'],
        }).plugin(store);
        new VuexPersistence({
            storage: {
                getItem: key => Cookies.get(key),
                setItem: (key, value) => Cookies.set(key, value),
            },
            modules: ['cookies'],
        }).plugin(store);
        store.dispatch('wallet/autoConnect');
        store.dispatch('network/setup', { isDev });
    });
};
