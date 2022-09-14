import { PriceOracleConfig, PriceOracleType } from './types';

export const DsThingOracleConfig: PriceOracleConfig = {
    currentPriceSlotAddress: '0x2',
    hasDelay: false,
};

export const DefaultOracleConfig: PriceOracleConfig = {
    currentPriceSlotAddress: '0x3',
    whitelistSlotAddress: '0x5',
    nextPriceSlotAddress: '0x4',
    hasDelay: true,
};

export const UnivOracleConfig: PriceOracleConfig = {
    currentPriceSlotAddress: '0x3',
    whitelistSlotAddress: '0x2',
    nextPriceSlotAddress: '0x4',
    hasDelay: true,
};

export const priceOracleTypeToConfig: Record<PriceOracleType, PriceOracleConfig> = {
    dsThing: DsThingOracleConfig,
    default: DefaultOracleConfig,
    univ: UnivOracleConfig,
};
