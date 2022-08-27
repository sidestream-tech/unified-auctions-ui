import { warpTime } from '../../helpers/hardhat';

export default async () => {
    await warpTime('custom');
};
