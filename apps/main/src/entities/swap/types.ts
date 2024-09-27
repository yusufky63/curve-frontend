import type { ExtractQueryKeyType } from '@/shared/types/api'
import type { PoolQueryParams, PoolSignerBase } from '@/entities/pool'

import { swapKeys } from '@/entities/swap'

// keys
export type SwapQueryKeyType<K extends keyof typeof swapKeys> = ExtractQueryKeyType<typeof swapKeys, K>

// form
export type SwapFormValues = {
  isFrom: boolean | null
  fromAddress: string
  fromToken: string
  fromAmount: string
  fromError: 'too-much' | ''
  toAddress: string
  toAmount: string
  toError: 'too-much-reserves' | ''
  toToken: string
}

// query
export type SwapExchangeDetails = PoolQueryParams &
  Pick<SwapFormValues, 'isFrom' | 'fromAddress' | 'fromToken' | 'fromAmount' | 'toAddress' | 'toToken' | 'toAmount'> & {
    isInProgress: boolean
    isWrapped: boolean
    maxSlippage: string
    ignoreExchangeRateCheck: boolean | undefined
    tokens: Token[]
  }

export type SwapApproval = PoolSignerBase &
  Pick<SwapFormValues, 'fromAddress' | 'fromAmount' | 'toAddress'> & {
    isInProgress: boolean
    isWrapped: boolean
    maxSlippage: string
  }

export type SwapEstGas = PoolSignerBase &
  Pick<SwapFormValues, 'fromAddress' | 'fromAmount' | 'toAddress'> & {
    isApproved: boolean
    isInProgress: boolean
    isWrapped: boolean
    maxSlippage: string
  }

// response
type ExchangeRateResp = {
  from: string
  to: string
  fromAddress: string
  value: string
  label: string
}

export type LowExchangeRateModal = {
  lowExchangeRate: boolean
  title: string
  exchangeRate: string
  toAmount: string
  toToken: string
}

export type PriceImpactModal = {
  priceImpact: boolean
  title: string
  value: string
  toAmount: string
  toToken: string
}

export type PriceImpactLowExchangeRateModal = {
  priceImpactLowExchangeRate: boolean
  title: string
  value: string
  exchangeRate: string
  toAmount: string
  toToken: string
}

export type SwapExchangeDetailsResp = {
  exchangeRates: ExchangeRateResp[]
  isExchangeRateLow: boolean
  isHighImpact: boolean
  priceImpact: number | null
  fromAmount: string
  toAmount: string
  modal: LowExchangeRateModal | PriceImpactModal | PriceImpactLowExchangeRateModal | null
  warning: 'warning-exchange-rate-low' | ''
}

export type SwapEstGasApprovalResp = {
  isApproved: boolean
  estimatedGas: number | number[] | null
}

// mutation
export type MutateBase = PoolSignerBase & {
  isApproved: boolean
  isLoadingDetails: boolean
}

export type ApproveSwap = MutateBase &
  Pick<SwapFormValues, 'fromAddress' | 'fromToken' | 'fromAmount' | 'fromError'> & {
    isWrapped: boolean
  }

export type Swap = MutateBase &
  Pick<
    SwapFormValues,
    'fromAddress' | 'fromToken' | 'fromAmount' | 'fromError' | 'toAddress' | 'toToken' | 'toAmount'
  > & {
    isWrapped: boolean
    maxSlippage: string
  }
