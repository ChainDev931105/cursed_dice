import { createTheme, StyledEngineProvider, ThemeProvider } from '@mui/material';
import { FC, ReactNode } from 'react';

const theme = createTheme({

});

export const Theme: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={theme}>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

