import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
const ETHEREUM_NETWORK = 'localhost';
const KEEPER_WALLET_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82';
const URL_TO_VISIT = 'http:///localhost:3000/collateral?network=localhost';

describe('Some buttons are clicked', function () {
    let signerAddress;
    it('Clicks the button', async function () {
        setSigner(ETHEREUM_NETWORK, createSigner(ETHEREUM_NETWORK, KEEPER_WALLET_PRIVATE_KEY));
        const signer = await getSigner(ETHEREUM_NETWORK);
        signerAddress = await signer.getAddress();
        cy.visit(URL_TO_VISIT);
        cy.window()
            .its('$nuxt')
            .then(nuxt => nuxt.$store.dispatch('wallet/setAddress', signerAddress));
        cy.get('table').first({ timeout: 140000 }).should('contain.text', 'ETH');
        cy.get('button').eq(6).should('contain.text', 'participate').click();
        cy.window()
            .its('$nuxt')
            .then(nuxt => nuxt.$store.dispatch('authorizations/authorizeWallet'));
    });
});
