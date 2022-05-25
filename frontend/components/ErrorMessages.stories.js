import { storiesOf } from '@storybook/vue';
import parseMetamaskError from 'auctions-core/src/helpers/parseMetamaskError';

storiesOf('ErrorMessages', module)
    .add('Replacement fee too low', () => ({
        data: () => ({
            errorMessage:
                'replacement fee too low (error={"code":-32603,"message":"[ethjs-query] while formatting outputs from RPC \'{\\"value\\":{\\"code\\":-32000,\\"message\\":\\"replacement transaction underpriced\\"}}\'","stack":"{\\n \\"code\\": -32603,\\n \\"message\\": \\"[ethjs-query] while formatting outputs from RPC \'{\\\\\\"value\\\\\\":{\\\\\\"code\\\\\\":-32000,\\\\\\"message\\\\\\":\\\\\\"replacement transaction underpriced\\\\\\"}}\'\\",\\n \\"stack\\": \\"Error: [ethjs-query] while formatting outputs from RPC \'{\\\\\\"value\\\\\\":{\\\\\\"code\\\\\\":-32000,\\\\\\"message\\\\\\":\\\\\\"replacement transaction underpriced\\\\\\"}}\'\n',
        }),
        computed: {
            parsedErrorMessage() {
                return parseMetamaskError(this.errorMessage);
            },
        },
        template: '<div><pre>{{errorMessage}}</pre><br />{{parsedErrorMessage}}</div>',
    }))
    .add('Cannot estimate gas', () => ({
        data: () => ({
            errorMessage:
                'cannot estimate gas; transaction may fail or may require manual gas limit (error={"code":-32603,"message":"execution reverted: Clipper/not-running-auction","data":{"originalError":{"code":3,"data":"0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001b436c69707065722f6e6f742d72756e6e696e672d61756374696f6e0000000000","message":"execution reverted: Clipper/not-running-auction"}}}, method="estimateGas", transaction={"from":"0xB2E1284Fb685dbDcc4378cF5d4E9515679527a42","maxPriorityFeePerGas":{"type":"BigNumber","hex":"0x59682f00"},"maxFeePerGas":{"type":"BigNumber","hex":"0xbaabef8640"},"to":"0xb0ece6F5542A4577E2f1Be491A937Ccbbec8479e","data":"0x81a794cb000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000ff4327f3f09430c010000000000000000000000000000000000000004aaebc81e9fe122a2aab7215400000000000000000000000074893c37beacf205507ea794470b13de0629422000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000180000000000000000000000000b2e1284fb685dbdcc4378cf5d4e9515679527a42000000000000000000000000f11a98339fe1cde648e8d1463310ce3ccc3d7cc1000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000000030000000000000000000000001f9840a85d5af5bf1d1762f925bdaddc4201f984000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f0000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000006b175474e89094c44da98b954eedeac495271d0f","type":2,"accessList":null}, code=UNPREDICTABLE_GAS_LIMIT, version=providers/5.4.5)\n',
        }),
        computed: {
            parsedErrorMessage() {
                return parseMetamaskError(this.errorMessage);
            },
        },
        template: '<div><pre>{{errorMessage}}</pre><br />{{parsedErrorMessage}}</div>',
    }))
    .add('Redo Transaction failed', () => ({
        data: () => ({
            errorMessage:
                'transaction failed (transactionHash="0x4cef9558c8062c4327c0c7ea321cd560ae6ae680e38ec0c4042fbcca771f983f", transaction={"hash":"0x4cef9558c8062c4327c0c7ea321cd560ae6ae680e38ec0c4042fbcca771f983f","type":2,"accessList":null,"blockHash":null,"blockNumber":null,"transactionIndex":null,"confirmations":0,"from":"0xB2E1284Fb685dbDcc4378cF5d4E9515679527a42","gasPrice":{"type":"BigNumber","hex":"0x77359400"},"maxPriorityFeePerGas":{"type":"BigNumber","hex":"0x77359400"},"maxFeePerGas":{"type":"BigNumber","hex":"0x77359400"},"gasLimit":{"type":"BigNumber","hex":"0x01ae39"},"to":"0xA5d173b77965F2A58B0686b5683f3277de8d3D66","value":{"type":"BigNumber","hex":"0x00"},"nonce":5,"data":"0xd843416d0000000000000000000000000000000000000000000000000000000000000007000000000000000000000000b2e1284fb685dbdcc4378cf5d4e9515679527a42","r":"0x76deda84e3d883df43ad08143c4b1d5f7b7d23f7250051e67682583d84cbe9ba","s":"0x327d196e509dfd1b328db170f0112b834b77151b534e35f04d027878215a45dd","v":1,"creates":null,"chainId":0}, receipt={"to":"0xA5d173b77965F2A58B0686b5683f3277de8d3D66","from":"0xB2E1284Fb685dbDcc4378cF5d4E9515679527a42","contractAddress":null,"transactionIndex":4,"gasUsed":{"type":"BigNumber","hex":"0x01ae39"},"logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","blockHash":"0x9208f7bc84d2b4348da7074d9ae7ce22a8a4556e955852c1255b920a286c0588","transactionHash":"0x4cef9558c8062c4327c0c7ea321cd560ae6ae680e38ec0c4042fbcca771f983f","logs":[],"blockNumber":6905447,"confirmations":1,"cumulativeGasUsed":{"type":"BigNumber","hex":"0x048424"},"effectiveGasPrice":{"type":"BigNumber","hex":"0x77359400"},"status":0,"type":2,"byzantium":true}, code=CALL_EXCEPTION, version=providers/5.4.5)',
        }),
        computed: {
            parsedErrorMessage() {
                return parseMetamaskError(this.errorMessage);
            },
        },
        template: '<div><pre>{{errorMessage}}</pre><br />{{parsedErrorMessage}}</div>',
    }))
    .add('Bidding Transaction failed', () => ({
        data: () => ({
            errorMessage:
                'transaction failed (transactionHash="0xa96d4a90c2b35868b7e87f5d00993187f09d77ab7eb38543c0cbb88bc6bc50e6", transaction={"hash":"0xa96d4a90c2b35868b7e87f5d00993187f09d77ab7eb38543c0cbb88bc6bc50e6","type":2,"accessList":null,"blockHash":null,"blockNumber":null,"transactionIndex":null,"confirmations":0,"from":"0xB2E1284Fb685dbDcc4378cF5d4E9515679527a42","gasPrice":{"type":"BigNumber","hex":"0xa8414a54fa"},"maxPriorityFeePerGas":{"type":"BigNumber","hex":"0x59682f00"},"maxFeePerGas":{"type":"BigNumber","hex":"0xa8414a54fa"},"gasLimit":{"type":"BigNumber","hex":"0x0710ac"},"to":"0x71eb894330e8a4b96b8d6056962e7F116F50e06F","value":{"type":"BigNumber","hex":"0x00"},"nonce":25,"data":"0x81a794cb000000000000000000000000000000000000000000000000000000000000002f00000000000000000000000000000000000000000000000197138424311b81270000000000000000000000000000000000000016bff25f6a69e777f5741db6a0000000000000000000000000db9c76109d102d2a1e645dca3a7e671ebfd8e11a00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000100000000000000000000000000b2e1284fb685dbdcc4378cf5d4e9515679527a4200000000000000000000000008638ef1a205be6762a8b935f5da9b700cf7322c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002bc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f000000000000000000000000000000000000000000","r":"0x2b0990ac5480cc92fea332a1b7bdf33a049b1bd59d0979f2e23c7bb9db0ca101","s":"0x060b3498c87aaed4894cd4146c37b3c1b0612137ea776a7dd7e9ff3ee8b968f8","v":1,"creates":null,"chainId":0}, receipt={"to":"0x71eb894330e8a4b96b8d6056962e7F116F50e06F","from":"0xB2E1284Fb685dbDcc4378cF5d4E9515679527a42","contractAddress":null,"transactionIndex":117,"gasUsed":{"type":"BigNumber","hex":"0xcac5"},"logsBloom":"0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000","blockHash":"0xd394b46ea0ce8e44b7ffeb2ba79c0a7918df281273f43e3aefd800233af405b8","transactionHash":"0xa96d4a90c2b35868b7e87f5d00993187f09d77ab7eb38543c0cbb88bc6bc50e6","logs":[],"blockNumber":14759521,"confirmations":3,"cumulativeGasUsed":{"type":"BigNumber","hex":"0x9cc2e5"},"effectiveGasPrice":{"type":"BigNumber","hex":"0x4ef3c6e0ad"},"status":0,"type":2,"byzantium":true}, code=CALL_EXCEPTION, version=providers/5.4.5)\n',
        }),
        computed: {
            parsedErrorMessage() {
                return parseMetamaskError(this.errorMessage);
            },
        },
        template: '<div><pre>{{errorMessage}}</pre><br />{{parsedErrorMessage}}</div>',
    }));
