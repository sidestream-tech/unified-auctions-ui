import VuexPersistence from 'vuex-persist';
import Cookies from 'js-cookie';

export default ({ store }) => {
    window.onNuxtReady(() => {
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
        const network = store.getters['network/getMakerNetwork'];
        if (network) {
            store.dispatch('auctions/fetch');
            store.dispatch('wallet/autoConnect');
        }
    });
};
