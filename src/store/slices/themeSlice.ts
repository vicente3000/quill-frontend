// store/slices/themeSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { fallbackThemeByMode, resolveTheme } from '@/styles/themes';
import type { ThemeName } from '@/styles/themes';

interface ThemeState {
  currentTheme: ThemeName;
}

const defaultTheme: ThemeName = fallbackThemeByMode.dark;

const initialState: ThemeState = {
  currentTheme: defaultTheme,
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeName>) => {
      state.currentTheme = action.payload;
      localStorage.setItem('theme', action.payload);
      applyThemeToDom(action.payload);
    },
  },
});

// Helper para aplicar tema al DOM
function applyThemeToDom(theme: ThemeName) {
  const root = document.documentElement;
  const { mode, palette } = resolveTheme(theme);

  root.setAttribute('data-palette', theme);
  root.setAttribute('data-theme-mode', mode);
  root.style.colorScheme = mode;

  Object.entries(palette).forEach(([key, value]) => {
    const cssVarName = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
    root.style.setProperty(cssVarName, value);
  });
}

if (typeof document !== 'undefined') {
  applyThemeToDom(initialState.currentTheme);
}

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
