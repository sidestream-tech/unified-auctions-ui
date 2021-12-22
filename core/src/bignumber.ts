import BigNumber from 'bignumber.js';
import { RAY_NUMBER_OF_DIGITS } from './constants/UNITS';

BigNumber.config({ DECIMAL_PLACES: RAY_NUMBER_OF_DIGITS });

export default BigNumber;
