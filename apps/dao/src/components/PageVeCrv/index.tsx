import { SubNavItem } from '@/components/SubNav/types'

import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import useStore from '@/store/useStore'

import CrvStats from './CrvStats'
import VeCrvFees from './VeCrvFeesTable'
import DailyLocks from './DailyLocksChart'
import TopHolders from './TopHoldersChart'
import HoldersTable from './HoldersTable'
import SubNav from '../SubNav'
import Box from '@/ui/Box'

type VeCrvNavSelection = 'fees' | 'holders' | 'locks'

const VeCrv: React.FC = () => {
  const { getVeCrvHolders, veCrvHolders } = useStore((state) => state.vecrv)
  const [navSelection, setNavSelection] = useState<VeCrvNavSelection>('fees')

  const navItems: SubNavItem[] = [
    { key: 'fees', label: t`veCRV Fees` },
    { key: 'holders', label: t`Holders` },
    { key: 'locks', label: t`Locks` },
  ]

  useEffect(() => {
    if (veCrvHolders.topHolders.length === 0 && veCrvHolders.fetchStatus !== 'ERROR') {
      getVeCrvHolders()
    }
  }, [getVeCrvHolders, veCrvHolders.topHolders.length, veCrvHolders.fetchStatus])

  return (
    <Wrapper>
      <PageTitle>veCRV</PageTitle>
      <Content variant="secondary">
        <CrvStats />
        <SubNavWrapper>
          <SubNav
            activeKey={navSelection}
            navItems={navItems}
            setNavChange={setNavSelection as (key: string) => void}
            nested
          />
        </SubNavWrapper>
        {navSelection === 'fees' && <VeCrvFees />}
        {navSelection === 'holders' && (
          <Box flex flexColumn flexGap="var(--spacing-2)">
            <TopHolders />
            <HoldersTable />
          </Box>
        )}
        {navSelection === 'locks' && <DailyLocks />}
      </Content>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-4) auto var(--spacing-6);
  width: 65rem;
  max-width: 100%;
  flex-grow: 1;
  min-height: 100%;
  @media (min-width: 34.375rem) {
    max-width: 95%;
  }
`

const PageTitle = styled.h2`
  margin: var(--spacing-2) auto var(--spacing-1) var(--spacing-3);
  background-color: black;
  color: var(--nav--page--color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

const Content = styled(Box)`
  display: flex;
  flex-direction: column;
`

const SubNavWrapper = styled(Box)`
  padding-bottom: var(--spacing-2);
`

export default VeCrv
