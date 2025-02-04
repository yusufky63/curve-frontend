import type { Components, CSSObject } from '@mui/material/styles'
import { basicMuiTheme, ThemeKey } from '../basic-theme'
import { Palette } from '../palette'
import { ThemeFontFamily } from '../typography'

const COLORS = ['primary', 'secondary', 'success', 'alert'] as const
type Color = (typeof COLORS)[number]

export const BUTTONS_HEIGHTS = ['2rem', '2.5rem', '3rem'] as const // 32px, 40px, 48px

export const defineMuiButton = (mode: ThemeKey, palette: Palette): Components['MuiButton'] => {
  const colors = {
    primary: {
      color: palette.grey[50],
      backgroundColor: palette.primary.main,
      '&:hover': { backgroundColor: palette.neutral[900] },
      '&:disabled': { color: palette.text.disabled },
    },
    secondary: {
      color: palette.neutral[50],
      backgroundColor: palette.primary[900],
      '&:hover': { backgroundColor: palette.primary.main },
      '&:disabled': {
        color: palette.text.disabled,
        backgroundColor: palette.primary[950],
      },
    },
    success: {
      color: palette.success.contrastText,
      backgroundColor: palette.success.main,
      '&:hover': {
        color: palette.success.main,
        backgroundColor: palette.success.contrastText,
      },
      '&:disabled': {
        color: palette.neutral[950],
        backgroundColor: palette.secondary[200],
      },
    },
    alert: {
      color: palette.error.contrastText,
      backgroundColor: palette.error.main,
      '&:hover': {
        color: palette.error.main,
        backgroundColor: palette.error.contrastText,
      },
      '&:disabled': {
        color: palette.neutral[950],
        backgroundColor: palette.tertiary[200],
      },
    },
  }
  const getNavigationButtonStyle = (): CSSObject => ({
    color: palette.text.tertiary,
    '&.current': {
      color: palette.grey[50],
      backgroundColor: palette.background.highlightFill,
    },
    '&:hover': {
      color: palette.text.primary,
      backgroundColor: palette.background.layer1Fill,
    },
  })

  const getOutlinedButtonStyle = (color: Color): CSSObject => ({
    ...getGhostButtonStyle(color),
    border: `1px solid ${colors[color].backgroundColor}`,
  })

  const getGhostButtonStyle = (color: Color): CSSObject => ({
    ...colors[color],
    color: palette.text.highlight,
    backgroundColor: 'transparent',
    '&:hover': {
      color: palette.neutral[50],
      backgroundColor: palette.neutral[900],
    },
    '&:disabled': {
      color: palette.text.disabled,
      backgroundColor: palette.neutral[900],
    },
  })

  const fontFamily = ThemeFontFamily[mode].button
  const [smallHeight, mediumHeight, largeHeight] = BUTTONS_HEIGHTS
  const [sm, md, lg] = [2, 3, 4].map(i => basicMuiTheme.spacing(i))
  return {
    styleOverrides: {
      root: {
        variants: [
          // todo: variants shouldn't have colors
          ...COLORS.map((color) => ({ props: { color }, style: colors[color] })),
          ...COLORS.map((color) => ({ props: { variant: 'ghost', color }, style: getGhostButtonStyle(color) })),
          ...COLORS.map((color) => ({ props: { variant: 'outlined', color }, style: getOutlinedButtonStyle(color) })),
          {
            props: { color: 'navigation' },
            style: getNavigationButtonStyle(),
          },
        ],
        borderRadius: 0,
        border: `2px solid transparent`,
        boxSizing: 'border-box',
        '&:focus': { borderColor: palette.primary[500] },
      },
      sizeLarge: {
        height: largeHeight,
        padding: `0 ${md}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${sm}0px` },
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '24px',
        textTransform: 'uppercase',
        fontFamily,
      },
      sizeMedium: {
        height: mediumHeight,
        padding: `0 ${md}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${sm}px` },
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '24px',
        textTransform: 'uppercase',
        fontFamily,
      },
      sizeSmall: {
        height: smallHeight,
        padding: `0 ${lg}px`,
        [basicMuiTheme.breakpoints.down('tablet')]: { padding: `0 ${md}px` },
        fontSize: '14px',
        fontWeight: 700,
        lineHeight: '16px',
        textTransform: 'uppercase',
        fontFamily: ThemeFontFamily[mode].button,
      },
    },
  }
}
