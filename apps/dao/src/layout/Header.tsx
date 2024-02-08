import type { MessageDescriptor } from '@lingui/core'

import { useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { msg, t } from '@lingui/macro'
import { i18n } from '@lingui/core'

import { CONNECT_STAGE, breakpoints, isLoading } from '@/ui/utils'
import { useConnectWallet } from '@/onboard'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { getWalletSignerAddress } from '@/store/createWalletSlice'
import { useHeightResizeObserver } from '@/ui/hooks'
import networks, { visibleNetworksList } from '@/networks'
import useStore from '@/store/useStore'

import { Chip } from '@/ui/Typography'
import Box from '@/ui/Box'
import ConnectWallet from '@/ui/Button/ConnectWallet'
import CurveLogoLink from '@/layout/CurveLogoLink'
import HeaderMobile from '@/layout/HeaderMobile'
import HeaderSecondary from '@/layout/HeaderSecondary'
import SelectNetwork from '@/ui/Select/SelectNetwork'

export type Page = {
  route: string
  label: MessageDescriptor
}

const PAGES: Page[] = [
  { route: ROUTE.PAGE_PROPOSALS, label: msg`Proposals` },
  { route: ROUTE.PAGE_GAUGEVOTING, label: msg`Gauge Voting` },
]

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const mainNavHeight = useHeightResizeObserver(mainNavRef)

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.isMdUp)
  const pageWidth = useStore((state) => state.pageWidth)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateLayoutHeight = useStore((state) => state.updateLayoutHeight)

  const { rChainId, rNetworkIdx, rLocalePathname } = getParamsFromUrl()

  const getPath = (route: string) => {
    const networkName = networks[rChainId || '1'].id
    return `#${rLocalePathname}/${networkName}${route}`
  }

  const handleNetworkChange = (selectedChainId: React.Key) => {
    if (rChainId !== selectedChainId) {
      const network = networks[selectedChainId as ChainId].id
      navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
    }
  }

  const handleConnectWallet = useCallback(() => {
    if (wallet) {
      updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET)
    } else {
      updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [''])
    }
  }, [updateConnectState, wallet])

  useEffect(() => {
    updateLayoutHeight('mainNav', mainNavHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainNavHeight])

  const SelectNetworkComp = (
    <StyledSelectNetwork
      connectState={connectState}
      buttonStyles={{ textTransform: 'uppercase' }}
      items={visibleNetworksList}
      loading={isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)}
      minWidth="9rem"
      mobileRightAlign
      selectedKey={(rNetworkIdx === -1 ? '' : rChainId).toString()}
      onSelectionChange={handleNetworkChange}
    />
  )

  const handleLocaleChange = (selectedLocale: string) => {
    const locale = selectedLocale !== 'en' ? `/${selectedLocale}` : ''
    const { rNetwork } = getNetworkFromUrl()
    navigate(`${locale}/${rNetwork}/${getRestFullPathname()}`)
  }

  return (
    <>
      {isMdUp && <HeaderSecondary handleLocaleChange={handleLocaleChange} />}
      <StyledNavBar as="nav" ref={mainNavRef} aria-label="Main menu" flex flexAlignItems="stretch" isMdUp={isMdUp}>
        <NavBarContent
          className="nav-content"
          grid
          gridAutoFlow="column"
          flexJustifyContent="space-between"
          pageWidth={pageWidth}
        >
          {isMdUp ? (
            <>
              <Menu grid gridAutoFlow="column" gridColumnGap="var(--spacing-2)" flexAlignItems="center">
                <CurveLogoLink />
                {PAGES.map(({ route, label }) => {
                  let isActive = false
                  if (location?.pathname) {
                    isActive = location.pathname.endsWith(route)
                  }

                  return (
                    <InternalLinkText as="a" key={route} className={isActive ? 'active' : ''} href={getPath(route)}>
                      {i18n._(label)}
                    </InternalLinkText>
                  )
                })}
                {/*<DividerHorizontal />*/}
              </Menu>

              <Menu grid gridAutoFlow="column" gridColumnGap="var(--spacing-2)" flexAlignItems="center">
                {SelectNetworkComp}
                <ConnectWallet
                  connectState={connectState}
                  walletSignerAddress={getWalletSignerAddress(wallet)}
                  handleClick={handleConnectWallet}
                />
              </Menu>
            </>
          ) : (
            <HeaderMobile
              pages={PAGES}
              rChainId={rChainId}
              selectNetwork={SelectNetworkComp}
              handleConnectWallet={handleConnectWallet}
              handleLocaleChange={handleLocaleChange}
            />
          )}
        </NavBarContent>
      </StyledNavBar>
    </>
  )
}

const InternalLinkText = styled(Chip)`
  align-items: center;
  display: flex;
  min-height: var(--height-medium);
  padding: 0 0.5rem;
  color: inherit;
  font-weight: var(--font-weight--bold);
  text-decoration: none;
  :active {
    transform: none;
  }
  :hover {
    color: var(--nav_link--hover--color);
    background-color: var(--nav_link--hover--background-color);
  }
  &.active,
  &.active:hover {
    color: var(--nav_link--active--hover--color);
    background-color: var(--nav_link--active--hover--background-color);
  }
`

export const Menu = styled(Box)<{ gridColumnGap?: string }>`
  @media (min-width: ${breakpoints.md}rem) {
    grid-column-gap: ${({ gridColumnGap }) => gridColumnGap ?? 'var(--spacing-3)'};
  }
`

type NavBarContentProps = {
  pageWidth: PageWidthClassName | null
}

const NavBarContent = styled(Box)<NavBarContentProps>`
  margin: 0 auto;
  max-width: var(--width);
  padding: 0 var(--spacing-narrow);
  width: 100%;
  @media (min-width: ${breakpoints.md}rem) {
    padding: 0 var(--spacing-normal);
  }
`

type NavBarProps = {
  isMdUp: boolean
}

const NavBar = styled(Box)<NavBarProps>`
  height: var(--header-height);
  //position: sticky;
  top: ${({ isMdUp }) => (isMdUp ? 'var(--top-nav-bottom)' : '0')};
  font-size: var(--font-size-2);
  text-transform: uppercase;
  color: var(--nav--color);
  background-color: var(--page--background-color);
  z-index: var(--z-index-page-nav);
`

const StyledNavBar = styled(NavBar)`
  box-shadow: 0 2px 3px 0 rgb(0 0 0 / 20%);
`

const StyledSelectNetwork = styled(SelectNetwork)`
  && {
    height: var(--height-medium);
  }
`

export default Header
