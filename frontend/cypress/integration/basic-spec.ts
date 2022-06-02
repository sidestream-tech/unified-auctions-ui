import getSigner, { createSigner, setSigner } from 'auctions-core/src/signer';
const ETHEREUM_NETWORK = 'localhost';
const KEEPER_WALLET_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82';
const URL_TO_VISIT = 'http:///localhost:3000/collateral?network=localhost';

describe('Some buttons are clicked', function () {
    let signerAddress;
    beforeEach(() => {
        setSigner(ETHEREUM_NETWORK, createSigner(ETHEREUM_NETWORK, KEEPER_WALLET_PRIVATE_KEY));
        getSigner(ETHEREUM_NETWORK).then(signer =>
            signer.getAddress().then(addr => {
                signerAddress = addr;
            })
        );
    });
    it('Clicks the button', function () {
        cy.visit(URL_TO_VISIT);
        cy.window()
            .its('$nuxt')
            .then(nuxt => nuxt.$store.dispatch('wallet/setAddress', signerAddress));
        cy.wait(120000);
        cy.get('table').first().should('contain.text', 'ETH');
    });
});
