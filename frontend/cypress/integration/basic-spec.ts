import { BigNumber } from 'ethers';
import { expect } from 'chai';

const HARDHAT_WALLET_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82';
const URL_TO_VISIT = `${process.env.FRONTEND_URL || 'localhost:3000'}/collateral?network=localhost`;
const PAGE_LOAD_TIMOUT_MS = 140 * 1000;

describe('Collateral auctions', function () {
    // Set the private key to one of the deterministic hardhat keys.
    // see https://hardhat.org/hardhat-network#running-stand-alone-in-order-to-support-wallets-and-other-software
    let walletBalanceBefore: Record<string, BigNumber>;
    let walletBalanceAfter: Record<string, BigNumber>;

    function testSwapProfit() {
        cy.visit(URL_TO_VISIT);
        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                nuxt.$store.dispatch('wallet/createWalletFromPrivateKey', HARDHAT_WALLET_PRIVATE_KEY);
            });
        cy.get('table').first({ timeout: PAGE_LOAD_TIMOUT_MS }).should('contain.text', 'ETH');

        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                walletBalanceBefore = nuxt.$store.getters['wallet/walletBalances'];
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
                    .click({ timeout: 19 * 1000 })
            );

        cy.get('button.Button')
            .eq(8)
            .should('contain.text', 'Execute')
            .click({ timeout: 25 * 1000 })
            .then(() => {
                cy.get('svg.CloseIcon')
                    .eq(1, { timeout: 10 * 1000 })
                    .click();
                cy.get('svg.CloseIcon')
                    .first({ timeout: 10 * 1000 })
                    .click();
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
                cy.get('svg.animate-spin').eq(3, { timeout: PAGE_LOAD_TIMOUT_MS }).should('not.be.visible');
                cy.contains('Allow unlimited access to DAI').click();
                cy.get('button').eq(30).should('contain.text', 'deposit').click();
                cy.get('span.ant-modal-close-x').first().click();
            });
        cy.get('input.Input').first().type('100');
        cy.contains('Authorize WSTETH-A Transactions').click();

        cy.contains('Bid 100')
            .click({ timeout: 25 * 1000 })
            .then(() => {
                cy.get('svg.CloseIcon')
                    .eq(1, { timeout: 10 * 1000 })
                    .click();
                cy.get('svg.CloseIcon')
                    .first({ timeout: 10 * 1000 })
                    .click();
            });
    }
    it('participates with swap and with direct bid', function () {
        testSwapProfit();
        testBidWithDai();
        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                walletBalanceAfter = nuxt.$store.getters['wallet/walletBalances'];
                // eslint-disable-next-line no-unused-expressions
                expect(walletBalanceAfter.walletVatDAI.gt(walletBalanceBefore.walletVatDAI)).to.be.true;
            });
    });
});
