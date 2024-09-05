const features: FeatureList[] = [
    {
        title: 'Collateral Auctions UI',
        url: 'https://auctions.makerdao.network/collateral',
        items: [
            {
                text: `The tool shows explanatory texts on different Maker Protocol related topics (e.g.
                What is the Maker Protocol, What are collateral auctions, Why a user should participate,
                What’s the catch of participation)`,
            },
            {
                text: `The tool enables the user to see detailed metrics of collateral auctions`,
                items: [
                    {
                        text: `Basic auction information is fetched from the blockchain via the Infura API and
                        displayed in a structured way in the UI`,
                    },
                    {
                        text: `For the following metrics computations are being made from the tool based on the fetched input parameters`,
                        items: [
                            {
                                text: `Time till auction ends`,
                            },
                            {
                                text: `Current auction price per collateral in DAI`,
                            },
                            {
                                text: `Time till the next price drop`,
                            },
                            {
                                text: `Estimated time till profitability`,
                            },
                            {
                                text: `Current price on Uniswap per collateral in DAI`,
                                items: [
                                    {
                                        text: `The price on Uniswap per collateral is determined via the Uniswap v2 SDK / Uniswap v3 SDK`,
                                    },
                                ],
                            },
                            {
                                text: `Market difference between auction price and price on uniswap`,
                            },
                            {
                                text: `Auction price total`,
                            },
                            {
                                text: `Auction End (datetime)`,
                            },
                            {
                                text: `Potential profit in DAI`,
                            },
                            {
                                text: `Indicator on transaction fees (in ETH and DAI)`,
                            },
                            {
                                text: `Transaction outcome in DAI`,
                            },
                        ],
                    },
                ],
            },
            {
                text: `The tool provides a graphical user interface (GUI) to interact with smart contracts.
                However, all transactions are controlled through the user’s wallet. This is why the user is
                required to connect with a wallet in the first place. The user explicitly has to confirm each
                transaction that is prepared  via the tool from within the wallet. Final execution happens
                from within the wallet and incurs transaction fees. The tool itself cannot be used to execute
                transactions. The tool enables the user to engage in the following blockchain based actions:`,
                items: [
                    {
                        text: `Prepare the restart of an expired auction`,
                    },
                    {
                        text: `Prepare authorisation of DaiJoin contract`,
                        items: [
                            {
                                text: `This is an authorisation step needs to be executed before being able to participate in auctions`,
                            },
                            {
                                text: `It needs to be done once per wallet`,
                            },
                        ],
                    },
                    {
                        text: `Prepare authorisation of Clipper contract`,
                        items: [
                            {
                                text: `This is an authorisation step needs to be executed before being able to participate in auctions`,
                            },
                            {
                                text: `It needs to be done once per wallet for each collateral type`,
                            },
                        ],
                    },
                    {
                        text: `Prepare participation in an auction via flash lending functionality`,
                        items: [
                            {
                                text: `Note that the underlying mechanics of the flash lending are not provided by the tool
                                but facilitated through a smart contract not controlled by us (ie. exchange-callee contract)`,
                            },
                            {
                                text: `High level explainer on flash lending: The auctioned collateral is swapped for DAI
                                using a decentralized exchange, DAI is returned to the auction to cover the debt and spread
                                in DAI is collected as a profit - all in one transaction. The transaction fees are the only
                                capital requirement for the execution`,
                            },
                        ],
                    },
                    {
                        text: `Specify an outcome wallet other than the one connected to UI (ie. other than the one
                        executing the transaction)`,
                    },
                ],
            },
            {
                text: `After successful auction participation through the user’s wallet, the tool provides a
                link to the respective transaction on etherscan`,
            },
        ],
    },
    {
        title: `Unified auctions portal`,
        url: 'https://auctions.makerdao.network',
        items: [
            {
                text: `The tool provides an overview on different services related to the three core auction
                types (collateral auctions, surplus auctions, debt auctions) provided by the Maker protocol`,
            },
            {
                text: `The tool redirects the user to indicated services or github repos of indicated services`,
            },
        ],
    },
    {
        title: `Collateral auctions - dashboard page`,
        url: `https://auctions.makerdao.network/dashboard`,
        items: [
            {
                text: `The tools shows a list of supported collateral types with auction related parameters`,
                items: [
                    {
                        text: `Uniswap price`,
                    },
                    {
                        text: `step parameter`,
                    },
                    {
                        text: `cut parameter`,
                    },
                    {
                        text: `Token icon`,
                    },
                    {
                        text: `Link to token contract on etherscan`,
                    },
                ],
            },
        ],
    },
    {
        title: `X Bot`,
        url: `https://x.com/sidestream_labs`,
        items: [
            {
                text: `The bot informs via a tweet about each new started collateral auction`,
                items: [
                    {
                        text: `The message indicates the amount of collateral that is auctioned off`,
                    },
                    {
                        text: `The message includes a link to the respective auction in the tool (ie. 
                        Collateral Auction UI)`,
                    },
                ],
            },
        ],
    },
    {
        title: 'Auction Keeper',
        url: undefined,
        items: [
            {
                text: `The auction keeper is an open source tool provided by us for download`,
            },
            {
                text: `The keeper is not operated by us for or on behalf of the user`,
            },
            {
                text: `A user is able to download the code and run it themself`,
                items: [
                    {
                        text: `When a user runs the keeper it will read and write data via an RPC endpoint of the user`,
                    },
                    {
                        text: `The code requires access to the private keys of a user`,
                    },
                ],
            },
        ],
    },
];

export default features;
