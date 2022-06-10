import { BigNumber } from 'ethers';
import { expect } from 'chai';

const HARDHAT_WALLET_PRIVATE_KEY = '0x701b615bbdfb9de65240bc28bd21bbc0d996645a3dd57e7b12bc2bdf6f192c82';
const URL_TO_VISIT = `${process.env.FRONTEND_URL || 'localhost:3000'}/collateral?network=localhost`;
const PAGE_LOAD_TIMOUT_MS = 140 * 1000;
const CLICK_TIMEOUT = 15 * 1000;

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
        cy.get('div.justify-end').contains('Directly swap').click();
        cy.get('div').contains('Authorize DAI Transactions').click();
        cy.get('div').contains('Authorize ETH-C Transactions').click({ timeout: CLICK_TIMEOUT });

        cy.contains(/^Execute$/).click({ timeout: CLICK_TIMEOUT });
        cy.get('svg.CloseIcon').eq(1).click();
        cy.get('svg.CloseIcon').first().click();
    }
    function testBidWithDai() {
        cy.get('a').eq(2).should('contain.text', 'Participate').click();
        cy.contains(/^Bid with DAI$/).click();
        cy.contains(/^Manage DAI in VAT$/).click();
        cy.contains('Allow unlimited access to DAI').click({ timeout: CLICK_TIMEOUT });
        cy.contains(/^deposit$/).click();
        cy.get('span.ant-modal-close-x').first().click();
        cy.get('input.Input').first().type('100');
        cy.contains(/^Authorize .+ Transactions$/).click();

        cy.contains('Bid 100').click({ timeout: CLICK_TIMEOUT });
        // close the popups and return to the main collateral view
        cy.get('svg.CloseIcon').eq(1).click();
        cy.get('svg.CloseIcon').first().click();
        cy.window()
            .its('$nuxt')
            .then(function (nuxt) {
                walletBalanceAfter = nuxt.$store.getters['wallet/walletBalances'];
                // eslint-disable-next-line no-unused-expressions
                expect(walletBalanceAfter.walletVatDAI.gt(walletBalanceBefore.walletVatDAI)).to.be.true;
            });
    }
    it('participates with swap and with direct bid', function () {
        testSwapProfit();
        walletBalanceBefore = { ...walletBalanceAfter };
        testBidWithDai();
    });
});
