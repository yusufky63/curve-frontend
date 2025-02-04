import type { FilterKey } from '@/components/PageIntegrations/types'
import type { IntegrationsTags } from '@/ui/Integration/types'
import type { SelectNetworkItem } from '@/ui/SelectNetwork/SelectNetwork'

export function parseSearchParams(
  searchParams: URLSearchParams | undefined,
  rChainId: ChainId | '',
  visibleNetworksList: Iterable<SelectNetworkItem>,
  integrationsTags: IntegrationsTags | null,
) {
  const pFilterKey = searchParams?.get('filter')
  const pNetworkId = searchParams?.get('networkId')

  let parsed: { filterKey: FilterKey; filterNetworkId: string } = {
    filterKey: 'all',
    filterNetworkId: (pNetworkId ?? rChainId ?? '').toString(),
  }

  if (pFilterKey) {
    parsed.filterKey = (integrationsTags?.[pFilterKey]?.id ?? 'all') as FilterKey
  }

  if (pNetworkId) {
    parsed.filterNetworkId =
      Array.from(visibleNetworksList)
        .find(({ chainId }) => Number(pNetworkId) === chainId)
        ?.chainId?.toString() ?? ''
  }

  return parsed
}
