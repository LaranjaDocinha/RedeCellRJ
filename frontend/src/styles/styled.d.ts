// frontend/src/styles/styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryDark: string;
      primaryLight: string;
      secondary: string;
      secondaryDark: string;
      secondaryLight: string;
      error: string;
      success: string;
      warning: string;
      info: string;
      surface: string;
      background: string;
      onPrimary: string;
      onSecondary: string;
      onSurface: string;
      onBackground: string;
      onError: string;
      onSuccess: string;
      onInfo: string;
      onWarning: string;
    };
    spacing: {
      xxs: string;
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
      xxxl: string;
      xxxxl: string;
    };
    typography: {
      primaryFont: string;
      secondaryFont: string;
      displayLarge: { fontSize: string; lineHeight: string; fontWeight: number };
      displayMedium: { fontSize: string; lineHeight: string; fontWeight: number };
      displaySmall: { fontSize: string; lineHeight: string; fontWeight: number };
      headlineLarge: { fontSize: string; lineHeight: string; fontWeight: number };
      headlineMedium: { fontSize: string; lineHeight: string; fontWeight: number };
      headlineSmall: { fontSize: string; lineHeight: string; fontWeight: number };
      titleLarge: { fontSize: string; lineHeight: string; fontWeight: number };
      titleMedium: { fontSize: string; lineHeight: string; fontWeight: number };
      titleSmall: { fontSize: string; lineHeight: string; fontWeight: number };
      bodyLarge: { fontSize: string; lineHeight: string; fontWeight: number };
      bodyMedium: { fontSize: string; lineHeight: string; fontWeight: number };
      bodySmall: { fontSize: string; lineHeight: string; fontWeight: number };
      labelLarge: { fontSize: string; lineHeight: string; fontWeight: number };
      labelMedium: { fontSize: string; lineHeight: string; fontWeight: number };
      labelSmall: { fontSize: string; lineHeight: string; fontWeight: number };
    };
    breakpoints: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  }
}
