import {HARDHAT_PRIVATE_KEY} from '../../helpers/constants'
import { resetBlockchainFork } from '../../helpers/hardhat'

export default async () => {
    await resetBlockchainFork(14052140, HARDHAT_PRIVATE_KEY)
}
