import { createMuiTheme } from '@material-ui/core/styles';
import ColorConversion from 'color';

export const Color = {
  GREEN: '#5ECD91',
  PURPLE: '#5C29D4',
  BLACK: '#000000',
  GOLD: '#F0B946',
  RED: '#FC5454',
  GRAY: '#BDBDBD',
  WHITE: '#FFFFFF',
  BACKGROUND_GRAY: '#EEEEEE',
};

const fontFamily = ['Rubik', 'sans-serif'];

const theme = createMuiTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
  },
  overrides: {
  },
});

export default theme;
