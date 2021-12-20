import VuexPersistence from 'vuex-persist';

export default ({ store }) => {
    window.onNuxtReady(() => {
        new VuexPersistence({
            storage: window.localStorage,
            modules: ['preferences'],
        }).plugin(store);
        const network = store.getters['network/getMakerNetwork'];
        if (network) {
            store.dispatch('auctions/fetch');
            store.dispatch('wallet/autoConnect');
        }
    });
};
