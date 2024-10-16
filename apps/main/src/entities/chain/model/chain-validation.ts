import { createValidationSuite } from '@/shared/lib/validation'
import { enforce, group, test } from 'vest'
import { ChainParams } from '@/shared/model/root-keys'

export const chainValidationGroup = ({ chainId }: ChainParams) =>
  group('chainValidation', () => {
    test('chainId', () => {
      enforce(chainId).message('Chain ID is required').isNotEmpty().message('Invalid chain ID').isValidChainId()
    })
  })

export const chainValidationSuite = createValidationSuite(chainValidationGroup)
