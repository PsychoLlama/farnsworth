export interface Theme {
  background: string;
  foreground: string;
  text: string;
  black: string;
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  danger: string;
  info: string;
  white: string;
  overlay: string;
  'primary-overlay': string;
}

export const OneDark: Theme = {
  background: '#282C34',
  foreground: '#ABB2BF',
  overlay: '#282C34CC',
  text: '#ABB2BF',
  black: '#282C34',
  primary: '#61AFEF',
  secondary: '#E06C75',
  tertiary: '#98C379',
  quaternary: '#E5C07B',
  danger: '#C678DD',
  info: '#56B6C2',
  white: '#ABB2BF',
  'primary-overlay': '#61AFEF33',
};

export const OneLight: Theme = {
  background: '#FAFAFA',
  foreground: '#383A42',
  overlay: '#FAFAFACC',
  text: '#383A42',
  black: '#696C77',
  tertiary: '#50A14F',
  quaternary: '#C18401',
  primary: '#4078F2',
  secondary: '#E45649',
  danger: '#A626A4',
  info: '#0184BC',
  white: '#A0A1A7',
  'primary-overlay': '#4078F233',
};

// Variable names must stay in sync with `css.color(...)` utility.
export function exportToCss(theme: Theme) {
  return `
    --color-background: ${theme.background};
    --color-foreground: ${theme.foreground};
    --color-text: ${theme.text};

    --color-black: ${theme.black};
    --color-white: ${theme.white};

    --color-primary: ${theme.primary};
    --color-secondary: ${theme.secondary};
    --color-tertiary: ${theme.tertiary};
    --color-quaternary: ${theme.quaternary};
    --color-danger: ${theme.danger};
    --color-info: ${theme.info};

    --color-overlay: ${theme.overlay};
    --color-primary-overlay: ${theme['primary-overlay']};
  `;
}
