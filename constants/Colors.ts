/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#67f45dff'; // Primary Green
const tintColorDark = '#2e7d32';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#2e7d32', // Forest Green
    secondary: '#795548', // Earth Brown  
    accent: '#ffa000', // Orange/Yellow
    neutral: '#ffffff', // White
    lightGray: '#f5f5f5', // Light Grey
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#4caf50', // Lighter green for dark mode
    secondary: '#8d6e63', // Lighter brown for dark mode
    accent: '#ffb74d', // Lighter orange for dark mode
    neutral: '#ffffff',
    lightGray: '#333333',
  },
};
