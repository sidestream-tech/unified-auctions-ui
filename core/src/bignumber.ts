import BigNumber from 'bignumber.js';
import { RAD_NUMBER_OF_DIGITS } from './constants/UNITS';

BigNumber.config({ DECIMAL_PLACES: RAD_NUMBER_OF_DIGITS });

export default BigNumber;
