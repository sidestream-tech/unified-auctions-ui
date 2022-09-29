import getContract, { getContractInterfaceByName } from './contracts';
import getProvider from './provider';
import {
    VaultBase,
    CollateralType,
    VaultAmount,
    VaultCollateralParameters,
    Vault,
    VaultTransactionNotLiquidated,
    VaultTransaction,
} from './types';
import BigNumber from './bignumber';
import { ethers } from 'ethers';
import {
    DAI_NUMBER_OF_DIGITS,
    RAD_NUMBER_OF_DIGITS,
    RAY_NUMBER_OF_DIGITS,
    WAD_NUMBER_OF_DIGITS,
} from './constants/UNITS';
import { getApproximateLiquidationFees } from './fees';
import { fetchDateByBlockNumber } from './date';
import memoizee from 'memoizee';
import getSigner from './signer';
import executeTransaction from './execute';
import { getOsmPrices } from './oracles';

const CACHE_EXPIRY_MS = 60 * 1000;

const _fetchVaultBase = async (network: string, id: number): Promise<VaultBase> => {
    const contract = await getContract(network, 'CDP_MANAGER');
    const address = await contract.urns(id);
    if (address === '0x0000000000000000000000000000000000000000') {
        throw new Error('Vault does not exist');
    }
    const collateralTypeHex = await contract.ilks(id);
    const collateralType = ethers.utils.parseBytes32String(collateralTypeHex);
    return {
        id,
        address,
        collateralType,
        network,
    };
};

export const fetchVaultBase = memoizee(_fetchVaultBase, {
    promise: true,
    length: 2,
});

export const fetchVaultsCount = async (network: string): Promise<number> => {
    const contract = await getContract(network, 'CDP_MANAGER');
    const countHex = contract.count();
    return parseInt(countHex._hex, 16);
};

export const fetchVaultCollateralParameters = async (
    network: string,
    collateralType: CollateralType
): Promise<VaultCollateralParameters> => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const { rate, spot } = await contract.ilks(typeHex);
    return {
        stabilityFeeRate: new BigNumber(rate._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS),
        minUnitPrice: new BigNumber(spot._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS),
    };
};

export const fetchVaultAmount = async (
    network: string,
    collateralType: CollateralType,
    vaultAddress: string
): Promise<VaultAmount> => {
    const contract = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const { ink, art } = await contract.urns(typeHex, vaultAddress);
    return {
        initialDebtDai: new BigNumber(art._hex).shiftedBy(-DAI_NUMBER_OF_DIGITS),
        collateralAmount: new BigNumber(ink._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS),
    };
};

const _fetchGlobalLiquidationLimits = async (network: string) => {
    const contract = await getContract(network, 'MCD_DOG');
    const maximumProtocolDebtDaiHex = await contract.Hole();
    const maximumProtocolDebtDai = new BigNumber(maximumProtocolDebtDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const currentProtocolDebtDaiHex = await contract.Dirt();
    const currentProtocolDebtDai = new BigNumber(currentProtocolDebtDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    return {
        currentProtocolDebtDai,
        maximumProtocolDebtDai,
    };
};

export const fetchGlobalLiquidationLimits = memoizee(_fetchGlobalLiquidationLimits, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 1,
});

const _fetchCollateralLiquidationLimitsAndLiquidatorAddress = async (
    network: string,
    collateralType: CollateralType
) => {
    const contract = await getContract(network, 'MCD_DOG');
    const contractVat = await getContract(network, 'MCD_VAT');
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    const { hole, dirt, clip, chop } = await contract.ilks(typeHex);
    const { dust } = await contractVat.ilks(typeHex);
    return {
        currentCollateralDebtDai: new BigNumber(dirt._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS),
        maximumCollateralDebtDai: new BigNumber(hole._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS),
        liquidatiorContractAddress: clip,
        liquidationPenaltyRatio: new BigNumber(chop._hex).shiftedBy(-WAD_NUMBER_OF_DIGITS),
        minimalAuctionedDai: new BigNumber(dust._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS),
    };
};

export const fetchCollateralLiquidationLimitsAndLiquidatorAddress = memoizee(
    _fetchCollateralLiquidationLimitsAndLiquidatorAddress,
    {
        maxAge: CACHE_EXPIRY_MS,
        promise: true,
        length: 2,
    }
);

export const fetchVault = async (network: string, index: number): Promise<Vault> => {
    const vaultBase = await fetchVaultBase(network, index);
    const vaultCollateralParameters = await fetchVaultCollateralParameters(network, vaultBase.collateralType);
    const vaultAmount = await fetchVaultAmount(network, vaultBase.collateralType, vaultBase.address);
    const globalLiquidationLimits = await fetchGlobalLiquidationLimits(network);
    const { currentCollateralDebtDai, maximumCollateralDebtDai, liquidationPenaltyRatio, minimalAuctionedDai } =
        await fetchCollateralLiquidationLimitsAndLiquidatorAddress(network, vaultBase.collateralType);
    return {
        ...vaultBase,
        ...vaultCollateralParameters,
        ...vaultAmount,
        ...globalLiquidationLimits,
        lastSyncedAt: new Date(),
        currentCollateralDebtDai,
        maximumCollateralDebtDai,
        liquidationPenaltyRatio,
        minimalAuctionedDai,
    };
};

const _fetchLiquidationRatioAndOracleAddress = async (network: string, collateralType: CollateralType) => {
    const contract = await getContract(network, 'MCD_SPOT');
    const collateralTypeAsHex = ethers.utils.formatBytes32String(collateralType);
    const oracleAndLiquidationRatio = await contract.ilks(collateralTypeAsHex);
    const liquidationRatioAsHex = oracleAndLiquidationRatio.mat;
    const oracleAddress = oracleAndLiquidationRatio.pip;
    const liquidationRatio = new BigNumber(liquidationRatioAsHex._hex).shiftedBy(-RAY_NUMBER_OF_DIGITS);
    return { oracleAddress, liquidationRatio };
};

export const fetchLiquidationRatioAndOracleAddress = memoizee(_fetchLiquidationRatioAndOracleAddress, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const _fetchVaultLiquidationIncentive = async (
    network: string,
    liquidatiorContractAddress: string,
    debtDai: BigNumber,
    liquidationPenaltyRatio: BigNumber
) => {
    const liquidatorContractInterface = await getContractInterfaceByName('MCD_CLIP_');
    const provider = await getProvider(network);
    const liquidatorContract = new ethers.Contract(liquidatiorContractAddress, liquidatorContractInterface, provider);
    const incentiveConstantDaiHex = await liquidatorContract.tip();
    const incentiveRelativeDaiHex = await liquidatorContract.chip();
    const incentiveRelativeDai = new BigNumber(incentiveRelativeDaiHex._hex)
        .shiftedBy(-WAD_NUMBER_OF_DIGITS)
        .multipliedBy(debtDai)
        .multipliedBy(liquidationPenaltyRatio);
    const incentiveConstantDai = new BigNumber(incentiveConstantDaiHex._hex).shiftedBy(-RAD_NUMBER_OF_DIGITS);
    const incentiveCombinedDai = incentiveRelativeDai.plus(incentiveConstantDai);
    return {
        incentiveCombinedDai,
        incentiveConstantDai,
        incentiveRelativeDai,
    };
};

export const fetchVaultLiquidationIncentive = memoizee(_fetchVaultLiquidationIncentive, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 3,
});

const _fetchLiquidatedParameters = async (network: string, vault: Vault) => {
    const contract = await getContract(network, 'MCD_DOG');
    const typeHex = ethers.utils.formatBytes32String(vault.collateralType);
    if (!vault.initialDebtDai.isZero()) {
        return;
    }
    const eventFilter = contract.filters.Bark(typeHex, vault.address, null, null, null, null, null);
    const liquidationEvents = await contract.queryFilter(eventFilter);
    if (liquidationEvents.length === 0) {
        return;
    }
    // there was a liquidation and the vault was not used again
    const liquidations = await Promise.all(
        liquidationEvents.map(async event => ({
            liquidationDate: await fetchDateByBlockNumber(network, event.blockNumber),
            transactionHash: event.transactionHash,
            auctionId: `${vault.collateralType}:${new BigNumber(event.args?.id._hex).toFixed(0)}`,
        }))
    );
    return liquidations.reverse();
};
export const fetchLiquidatedParameters = memoizee(_fetchLiquidatedParameters, {
    maxAge: CACHE_EXPIRY_MS,
    promise: true,
    length: 2,
});

const getInitialAuctionableDebtDai = (vault: Vault) => {
    const amountDaiCanBeAuctionedGloballyDai = vault.maximumProtocolDebtDai.minus(vault.currentProtocolDebtDai);
    const amountDaiCanBeAuctionedCollateralDai = vault.maximumCollateralDebtDai.minus(vault.currentCollateralDebtDai);
    const minimumDebtCovered = BigNumber.min(amountDaiCanBeAuctionedCollateralDai, amountDaiCanBeAuctionedGloballyDai);
    const amountNeededToCoverActiveAuctionsDai = minimumDebtCovered
        .div(vault.stabilityFeeRate)
        .div(vault.liquidationPenaltyRatio);
    if (vault.initialDebtDai.lte(amountNeededToCoverActiveAuctionsDai)) {
        return { initialDebtThatCanBeAuctionedDai: vault.initialDebtDai, isPartialLiquidation: false };
    }
    if (
        vault.initialDebtDai
            .minus(amountNeededToCoverActiveAuctionsDai)
            .multipliedBy(vault.stabilityFeeRate)
            .isLessThan(vault.minimalAuctionedDai)
    ) {
        return { initialDebtThatCanBeAuctionedDai: vault.initialDebtDai, isPartialLiquidation: false };
    }

    return { initialDebtThatCanBeAuctionedDai: amountNeededToCoverActiveAuctionsDai, isPartialLiquidation: true };
};

const getAuctionedDaiAndAuctionState = (proximityToLiquidation: BigNumber, vault: Vault) => {
    // logic from https://github.com/makerdao/dss/blob/fa4f6630afb0624d04a003e920b0d71a00331d98/src/dog.sol#L186
    // detemines if the vault is liquidatable and what amount of debt can be covered.
    let state: 'liquidatable' | 'not-liquidatable' = proximityToLiquidation.isLessThanOrEqualTo(0)
        ? 'liquidatable'
        : 'not-liquidatable';
    const { initialDebtThatCanBeAuctionedDai, isPartialLiquidation } = getInitialAuctionableDebtDai(vault);
    if (
        isPartialLiquidation &&
        initialDebtThatCanBeAuctionedDai.multipliedBy(vault.stabilityFeeRate).lt(vault.minimalAuctionedDai)
    ) {
        state = 'not-liquidatable';
    }
    return { state, auctionedAmountDai: initialDebtThatCanBeAuctionedDai };
};

const enrichVaultWithTransactonInformation = async (
    network: string,
    vault: Vault
): Promise<VaultTransactionNotLiquidated> => {
    const debtDai = vault.initialDebtDai.multipliedBy(vault.stabilityFeeRate);
    const { liquidatiorContractAddress, liquidationPenaltyRatio } =
        await fetchCollateralLiquidationLimitsAndLiquidatorAddress(network, vault.collateralType);

    const { liquidationRatio, oracleAddress } = await fetchLiquidationRatioAndOracleAddress(
        network,
        vault.collateralType
    );
    const collateralizationRatio = vault.collateralAmount
        .multipliedBy(vault.minUnitPrice)
        .multipliedBy(liquidationRatio)
        .dividedBy(debtDai);
    const proximityToLiquidation = new BigNumber(1).minus(debtDai.div(vault.collateralAmount).div(vault.minUnitPrice));
    const { transactionFeeLiquidationEth, transactionFeeLiquidationDai } = await getApproximateLiquidationFees(
        network
    );
    const { nextUnitPrice, nextPriceChange, currentUnitPrice } = await getOsmPrices(
        network,
        oracleAddress,
        vault.collateralType
    );
    const { auctionedAmountDai, state } = getAuctionedDaiAndAuctionState(proximityToLiquidation, vault);
    const { incentiveCombinedDai, incentiveConstantDai, incentiveRelativeDai } = await fetchVaultLiquidationIncentive(
        network,
        liquidatiorContractAddress,
        auctionedAmountDai,
        liquidationPenaltyRatio
    );

    return {
        ...vault,
        liquidationRatio,
        collateralizationRatio,
        proximityToLiquidation,
        incentiveConstantDai,
        incentiveCombinedDai,
        incentiveRelativeDai,
        grossProfitDai: incentiveCombinedDai,
        netProfitDai: incentiveCombinedDai.minus(transactionFeeLiquidationDai),
        transactionFeeLiquidationDai,
        debtDai,
        nextUnitPrice,
        nextPriceChange,
        currentUnitPrice,
        transactionFeeLiquidationEth,
        state,
    };
};

export const getVaultTransaction = async (network: string, vault: Vault): Promise<VaultTransaction> => {
    const liquidatedParameters = await fetchLiquidatedParameters(network, vault);
    if (liquidatedParameters) {
        return {
            ...vault,
            state: 'liquidated',
            pastLiquidations: liquidatedParameters,
        };
    }
    return await enrichVaultWithTransactonInformation(network, vault);
};

export const liquidateVault = async (
    network: string,
    collateralType: CollateralType,
    vaultAddress: string,
    incentiveBeneficiaryAddress?: string
) => {
    const sendIncentiveTo = incentiveBeneficiaryAddress
        ? incentiveBeneficiaryAddress
        : await (await getSigner(network)).getAddress();
    const typeHex = ethers.utils.formatBytes32String(collateralType);
    return await executeTransaction(network, 'MCD_DOG', 'bark', [typeHex, vaultAddress, sendIncentiveTo]);
};

const getLatestVault = async (network: string, walletAddress: string) => {
    const cdpManager = await getContract(network, 'CDP_MANAGER', true);
    const lastHex = await cdpManager.last(walletAddress);
    return new BigNumber(lastHex._hex).toNumber();
};

export const openVault = async (network: string, ownerAddress: string, collateralType: CollateralType) => {
    const argumentList = [ethers.utils.formatBytes32String(collateralType), ownerAddress];
    await executeTransaction(network, 'CDP_MANAGER', 'open', argumentList);
    return await getLatestVault(network, ownerAddress);
};

export const changeVaultContents = async (
    network: string,
    vaultId: number,
    differenceDebtDai: BigNumber,
    differenceCollateral: BigNumber
) => {
    const argumentList = [
        vaultId.toString(),
        differenceCollateral.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
        differenceDebtDai.shiftedBy(DAI_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, 'CDP_MANAGER', 'frob', argumentList);
};

export const collectStabilityFees = async (network: string, collateralType: CollateralType) => {
    return await executeTransaction(network, 'MCD_JUG', 'drip', [ethers.utils.formatBytes32String(collateralType)]);
};

export const changeCollateralInVault = async (
    network: string,
    vaultId: number,
    differenceCollateral: BigNumber,
    transferTargetAddress: string
) => {
    const argumentList = [
        vaultId.toString(0),
        transferTargetAddress,
        differenceCollateral.shiftedBy(WAD_NUMBER_OF_DIGITS).toFixed(0),
    ];
    await executeTransaction(network, 'CDP_MANAGER', 'flux(uint256,address,uint256)', argumentList);
};
