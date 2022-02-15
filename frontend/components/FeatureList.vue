<template>
    <div class="flex flex-col w-full space-y-10">
        <div v-for="feature in features" :key="feature.name">
            <TextBlock :title="feature.title">
                <div class="mb-4">
                    <span class="text-gray-700 dark:text-gray-200">URL:</span>
                    <a v-if="feature.url" :href="feature.url"> {{ feature.url }} </a>
                    <span v-else class="italic">Not yet implemented</span>
                </div>
                <h3 class="text-lg text-gray-700 font-semibold dark:text-gray-200 my-2">List of features:</h3>
                <ul
                    v-for="point in feature.features"
                    :key="point.text"
                    class="list-inside list-disc text-gray-700 dark:text-gray-200"
                >
                    <li :class="`Indent-${point.indent}`">{{ point.text }}</li>
                </ul>
            </TextBlock>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import TextBlock from '~/components/common/TextBlock.vue';

export default Vue.extend({
    components: {
        TextBlock,
    },
    data() {
        return {
            features: [
                {
                    title: 'Collateral Auctions UI',
                    url: 'https://auctions.makerdao.network/collateral',
                    features: [
                        {
                            text: `The tool shows explanatory texts on different Maker Protocol related topics (e.g.
                            What is the Maker Protocol, What are collateral auctions, Why a user should participate,
                            What’s the catch of participation)`,
                            indent: 0,
                        },
                        {
                            text: `The tool enables the user to see detailed metrics of collateral auctions`,
                            indent: 0,
                        },
                        {
                            text: `Basic auction information is fetched from the blockchain via the Infura API and
                            displayed in a structured way in the UI`,
                            indent: 1,
                        },
                        {
                            text: `For the following metrics computations are being made from the tool based on the fetched input parameters`,
                            indent: 1,
                        },
                        {
                            text: `Time till auction ends`,
                            indent: 2,
                        },
                        {
                            text: `Current auction price per collateral in DAI`,
                            indent: 2,
                        },
                        {
                            text: `Time till the next price drop`,
                            indent: 2,
                        },
                        {
                            text: `Estimated time till profitability`,
                            indent: 2,
                        },
                        {
                            text: `Current price on Uniswap per collateral in DAI`,
                            indent: 2,
                        },
                        {
                            text: `The price on Uniswap per collateral is determined via the Uniswap v2 SDK / Uniswap v3 SDK`,
                            indent: 3,
                        },
                        {
                            text: `Market difference between auction price and price on uniswap`,
                            indent: 2,
                        },
                        {
                            text: `Auction price total`,
                            indent: 2,
                        },
                        {
                            text: `Auction End (datetime)`,
                            indent: 2,
                        },
                        {
                            text: `Potential profit in DAI`,
                            indent: 2,
                        },
                        {
                            text: `Indicator on transaction fees (in ETH and DAI)`,
                            indent: 2,
                        },
                        {
                            text: `Transaction outcome in DAI`,
                            indent: 2,
                        },
                        {
                            text: `The tool provides a graphical user interface (GUI) to interact with smart contracts.
                            However, all transactions are controlled through the user’s wallet. This is why the user is
                            required to connect with a wallet in the first place. The user explicitly has to confirm each
                            transaction that is prepared  via the tool from within the wallet. Final execution happens
                            from within the wallet and incurs transaction fees. The tool itself cannot be used to execute
                            transactions. The tool enables the user to engage in the following blockchain based actions:`,
                            indent: 0,
                        },
                        {
                            text: `Prepare the restart of an expired auction`,
                            indent: 1,
                        },
                        {
                            text: `Prepare authorisation of DaiJoin contract`,
                            indent: 1,
                        },
                        {
                            text: `This is an authorisation step needs to be executed before being able to participate in auctions`,
                            indent: 2,
                        },
                        {
                            text: `It needs to be done once per wallet`,
                            indent: 2,
                        },
                        {
                            text: `Prepare authorisation of Clipper contract`,
                            indent: 1,
                        },
                        {
                            text: `This is an authorisation step needs to be executed before being able to participate in auctions`,
                            indent: 2,
                        },
                        {
                            text: `It needs to be done once per wallet for each collateral type`,
                            indent: 2,
                        },
                        {
                            text: `Prepare participation in an auction via flash lending functionality`,
                            indent: 1,
                        },
                        {
                            text: `Note that the underlying mechanics of the flash lending are not provided by the tool
                            but facilitated through a smart contract not controlled by us (ie. exchange-callee contract)`,
                            indent: 2,
                        },
                        {
                            text: `High level explainer on flash lending: The auctioned collateral is swapped for DAI
                            using a decentralized exchange, DAI is returned to the auction to cover the debt and spread
                            in DAI is collected as a profit - all in one transaction. The transaction fees are the only
                            capital requirement for the execution`,
                            indent: 2,
                        },
                        {
                            text: `Specify an outcome wallet other than the one connected to UI (ie. other than the one
                            executing the transaction)`,
                            indent: 1,
                        },
                        {
                            text: `After successful auction participation through the user’s wallet, the tool provides a
                            link to the respective transaction on etherscan`,
                            indent: 0,
                        },
                    ],
                },
                {
                    title: `Unified auctions portal`,
                    url: 'https://auctions.makerdao.network',
                    features: [
                        {
                            text: `The tool provides an overview on different services related to the three core auction
                            types (collateral auctions, surplus auctions, debt auctions) provided by the Maker protocol`,
                            indent: 0,
                        },
                        {
                            text: `The tool redirects the user to indicated services or github repos of indicated services`,
                            indent: 0,
                        },
                    ],
                },
                {
                    title: `Collateral auctions - dashboard page`,
                    url: `https://auctions.makerdao.network/dashboard`,
                    features: [
                        {
                            text: `The tools shows a list of supported collateral types with auction related parameters`,
                            indent: 0,
                        },
                        {
                            text: `Uniswap price`,
                            indent: 1,
                        },
                        {
                            text: `step parameter`,
                            indent: 1,
                        },
                        {
                            text: `cut parameter`,
                            indent: 1,
                        },
                        {
                            text: `Token icon`,
                            indent: 1,
                        },
                        {
                            text: `Link to token contract on etherscan`,
                            indent: 1,
                        },
                    ],
                },
                {
                    title: `Twitter Bot`,
                    url: `https://twitter.com/MakerDAO_SAS`,
                    features: [
                        {
                            text: `The bot informs via a tweet about each new started collateral auction`,
                            indent: 0,
                        },
                        {
                            text: `The message indicates the amount of collateral that is auctioned off`,
                            indent: 1,
                        },
                        {
                            text: `The message includes a link to the respective auction in the tool (ie. 
                            Collateral Auction UI)`,
                            indent: 1,
                        },
                    ],
                },
                {
                    title: 'Auction Keeper',
                    url: undefined,
                    features: [
                        {
                            text: `The auction keeper is an open source tool provided by us for download`,
                            indent: 0,
                        },
                        {
                            text: `The keeper is not operated by us for or on behalf of the user`,
                            indent: 0,
                        },
                        {
                            text: `A user is able to download the code and run it himself`,
                            indent: 0,
                        },
                        {
                            text: `When a user runs the keeper it will read and write data via an RPC endpoint of the user`,
                            indent: 1,
                        },
                        {
                            text: `The code requires access to the private keys of a user`,
                            indent: 1,
                        },
                    ],
                },
            ] as FeatureList[],
        };
    },
});
</script>

<style scoped>
.Indent-1 {
    margin-left: 25px;
    list-style-type: circle;
}

.Indent-2 {
    margin-left: 50px;
    list-style-type: square;
}

.Indent-3 {
    margin-left: 75px;
}
</style>
