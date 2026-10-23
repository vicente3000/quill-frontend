// styles/themes.ts
export type ThemeMode = 'light' | 'dark';

export type ThemeColorKey = 'background' | 'primary' | 'secondary' | 'accent' | 'text';

export type ThemePalette = Record<ThemeColorKey, string>;

type ThemeDefinition = {
  mode: ThemeMode;
  label: string;
  colors: Partial<ThemePalette>;
};

const modeDefaults: Record<ThemeMode, ThemePalette> = {
  light: {
    background: '#dddddd',
    primary: '#888888',
    secondary: '#bbbbbb',
    accent: '#666666',
    text: '#000000',
  },
  dark: {
    background: '#0A141A',
    primary: '#101F28',
    secondary: '#0B1820',
    accent: '#63C9C1',
    text: '#E7F0F2',
  },
};

export const themes = {
  lightDefault: {
    mode: 'light',
    label: 'Light Default',
    colors: {
    },
  },
  darkDefault: {
    mode: 'dark',
    label: 'Quill oscuro',
    colors: {
    },
  },

  lightHedge: {
    mode: 'light',
    label: 'Hedgehog Light',
    colors: {
      background: '#ded9ce',
      primary: '#7c644b',
      secondary: '#ada390',
      accent: '#57744f',
      text: '#27272a',
    },
  },
  lightLynx: {
    mode: 'light',
    label: 'Lynx Light',
    colors: {
      background: '#dedede',
      primary: '#9292a5',
      secondary: '#b4acc3',
      accent: '#41312a',
      text: '#0e0907',
    },
  },
  darkLynx: {
    mode: 'dark',
    label: 'Lynx Dark',
    colors: {
      background: '#16161c',
      primary: '#5a5a6d',
      secondary: '#443c53',
      accent: '#d5c5be',
      text: '#f8f3f1',
    },
  },
  darkOcean: {
    mode: 'dark',
    label: 'Ocean Dark',
    colors: {
      background: '#041030',
      primary: '#2aa1ad',
      secondary: '#174269',
      accent: '#f48e6b',
      text: '#f8f6f1',
    },
  },

} as const satisfies Record<string, ThemeDefinition>;

export type ThemeName = keyof typeof themes;

export const fallbackThemeByMode: Record<ThemeMode, ThemeName> = {
  light: 'lightDefault',
  dark: 'darkDefault',
};

export function isThemeName(value: string | null): value is ThemeName {
  if (!value) {
    return false;
  }

  return value in themes;
}

export function resolveTheme(themeName: ThemeName): { mode: ThemeMode; palette: ThemePalette } {
  const selected = themes[themeName];
  const fallbackName = fallbackThemeByMode[selected.mode];
  const fallback = themes[fallbackName];

  return {
    mode: selected.mode,
    palette: {
      ...modeDefaults[selected.mode],
      ...fallback.colors,
      ...selected.colors,
    },
  };
}
