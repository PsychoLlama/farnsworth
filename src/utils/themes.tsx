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
}

export const OneDark: Theme = {
  background: '#282C34',
  foreground: '#ABB2BF',
  text: '#ABB2BF',
  black: '#282C34',
  primary: '#61AFEF',
  secondary: '#E06C75',
  tertiary: '#98C379',
  quaternary: '#E5C07B',
  danger: '#C678DD',
  info: '#56B6C2',
  white: '#ABB2BF',
};

export const OneLight: Theme = {
  background: '#fafafa',
  foreground: '#383a42',
  text: '#383a42',
  black: '#696c77',
  tertiary: '#50a14f',
  quaternary: '#c18401',
  primary: '#4078f2',
  secondary: '#e45649',
  danger: '#a626a4',
  info: '#0184bc',
  white: '#a0a1a7',
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
  `;
}
