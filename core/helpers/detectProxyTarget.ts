import getProvider from '../src/provider';
import detectProxyTarget from 'evm-proxy-detection';

const detectProxyTargetByContractAddress = async (network: string, contractAddress: string) => {
    const provider = await getProvider(network);
    return await detectProxyTarget(contractAddress, ({ method, params }) => provider.send(method, params));
};

export default detectProxyTargetByContractAddress;
