import { type ThemeOptions } from '@mui/material/styles'
import { figmaTokens } from '../../../shared/api/figma-tokens'
import { ThemeKey } from '../../../shared/lib/basic-theme'
import { BUTTONS_HEIGHTS, defineMuiButton } from '../../../shared/ui/Button'
import { defineMuiTypography } from '../../../shared/ui/Typography'

const BUTTON_SIZE = BUTTONS_HEIGHTS[1] // medium

export const createComponents = (mode: ThemeKey): ThemeOptions['components'] => ({
  MuiTypography: defineMuiTypography(),
  MuiButton: defineMuiButton(figmaTokens, mode),
  MuiIconButton: {
    styleOverrides: {
      root: { borderRadius: 0 }
    }
  },
  MuiPaper: {
    styleOverrides: {
      root: { borderRadius: 0 }
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: { minHeight: BUTTON_SIZE },
      indicator: { top: 0 }
    }
  },
  MuiToolbar: {
    styleOverrides: {
      root: { minHeight: BUTTON_SIZE, paddingX: 3 }
    }
  },
  MuiTab: {
    styleOverrides: {
      root: { textTransform: 'uppercase', minHeight: BUTTON_SIZE }
    }
  },
  MuiContainer: {
    styleOverrides: { root: { display: 'flex', maxWidth: 'var(--width)' } },
  }
})
