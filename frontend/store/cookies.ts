import Cookies from 'js-cookie';

interface State {
    acceptedTerms: string | undefined;
}

export const state = (): State => ({
    acceptedTerms: Cookies.get('terms-and-conditions'),
});

export const getters = {
    hasAcceptedTerms(state: State): boolean {
        return state.acceptedTerms === 'accepted';
    },
};

export const actions = {
    acceptTerms() {
        Cookies.set('terms-and-conditions', 'accepted');
    },
};
