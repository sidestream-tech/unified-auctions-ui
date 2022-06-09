import { BigNumber } from 'ethers';
import { expect } from 'chai';

describe('Collateral auctions', function () {
    const KEEPER_WALLET_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82';
    const URL_TO_VISIT = 'http:///localhost:3000/collateral?network=localhost';
    let daiBalanceBefore: Record<string, BigNumber>;
    let daiBalanceAfter: Record<string, BigNumber>;

    function testSwapProfit() {
        cy.visit(URL_TO_VISIT);
        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                nuxt.$store.dispatch('wallet/createWalletFromPrivateKey', KEEPER_WALLET_PRIVATE_KEY);
            });
        cy.get('table').first({ timeout: 140000 }).should('contain.text', 'ETH');

        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                daiBalanceBefore = nuxt.$store.getters['wallet/walletBalances'];
            });

        cy.get('a').eq(1).should('contain.text', 'Participate').click();
        cy.get('button.Button').eq(3).should('contain.text', 'Directly swap').click();
        cy.get('button.Button')
            .eq(5)
            .should('contain.text', 'Authorize DAI Transactions')
            .click()
            .then(() =>
                cy
                    .get('button.Button')
                    .eq(6)
                    .should('contain.text', 'Authorize ETH-C Transactions')
                    .click({ timeout: 19000 })
            );

        cy.get('button.Button')
            .eq(8)
            .should('contain.text', 'Execute')
            .click({ timeout: 25000 })
            .then(() => {
                cy.get('svg.CloseIcon').eq(1, { timeout: 10000 }).click();
                cy.get('svg.CloseIcon').first({ timeout: 10000 }).click();
            });
    }
    function testBidWithDai() {
        cy.get('a').eq(2).should('contain.text', 'Participate').click();
        cy.get('button.Button').eq(2).should('contain.text', 'Bid with DAI').click();
        cy.get('button.Button')
            .eq(5)
            .should('contain.text', 'Manage DAI in VAT')
            .click()
            .then(() => {
                cy.get('svg.animate-spin').eq(3, { timeout: 140000 }).should('not.be.visible');
                cy.contains('Allow unlimited access to DAI').click();
                cy.get('button').eq(30).should('contain.text', 'deposit').click();
                cy.get('span.ant-modal-close-x').first().click();
            });
        cy.get('input.Input').first().type('100');
        cy.contains('Authorize WSTETH-A Transactions').click();

        cy.contains('Bid 100')
            .click({ timeout: 25000 })
            .then(() => {
                cy.get('svg.CloseIcon').eq(1, { timeout: 10000 }).click();
                cy.get('svg.CloseIcon').first({ timeout: 10000 }).click();
            });
    }
    it('participates with swap and with direct bid', function () {
        testSwapProfit();
        testBidWithDai();
        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                daiBalanceAfter = nuxt.$store.getters['wallet/walletBalances'];
                // eslint-disable-next-line no-unused-expressions
                expect(daiBalanceAfter.walletVatDAI.gt(daiBalanceBefore.walletVatDAI)).to.be.true;
            });
    });
});
