const KEEPER_WALLET_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82';
const URL_TO_VISIT = 'http:///localhost:3000/collateral?network=localhost';

describe('Some buttons are clicked', function () {
    it('Clicks the button', function () {
        cy.visit(URL_TO_VISIT);
        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                nuxt.$store.dispatch('wallet/createWalletFromPrivateKey', KEEPER_WALLET_PRIVATE_KEY);
            });
        cy.get('table').first({ timeout: 140000 }).should('contain.text', 'ETH');
        cy.get('button').eq(6).should('contain.text', 'participate').click();
        cy.window()
            .its('$nuxt')
            .then(nuxt => nuxt.$store.dispatch('authorizations/authorizeWallet'));
    });
});
