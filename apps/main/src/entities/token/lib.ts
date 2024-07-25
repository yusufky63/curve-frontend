import useTokensMapper from '@/hooks/useTokensMapper'
import useStore from '@/store/useStore'
import { useMemo } from 'react'
import type { Address } from 'viem'
import { useChainId } from '@/entities/chain'

export const useTokens = (addresses: Address[]): { data: (Token | undefined)[] } => {
  const { data: chainId } = useChainId()
  const { tokensMapper } = useTokensMapper(chainId)

  const tokensKey = JSON.stringify(addresses)

  const tokens = useMemo(
    () => addresses.map((address) => tokensMapper[address]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, tokensMapper]
  )

  return { data: tokens }
}

export const useTokensUSDRates = (tokens: Address[]): { data: (number | undefined)[] } => {
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)

  const tokensKey = JSON.stringify(tokens)

  const usdRates = useMemo(
    () => tokens.map((token) => usdRatesMapper[token]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokensKey, usdRatesMapper]
  )

  return { data: usdRates }
}
