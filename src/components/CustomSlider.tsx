import Slider from '@mui/material/Slider';
import { styled } from '@mui/material/styles';

export const CustomSlider = styled(Slider)(({ theme }) => ({
    height: '0em',
    padding: '0.4em',
    color: 'white',
    '& .MuiSlider-thumb': {
        height: 30,
        width: 30,
        borderStyle: 'solid',
        borderColor: '#8f4ff6',
    },
    '&:not(:first-of-type)': {
        borderRadius: 20,
    },
    '&:first-of-type': {
        borderRadius: 20,
    },
    backgroundColor: 'white',
    boxShadow: 'inset 0px 0px 5px 0px #000000',
    '& .MuiSlider-mark': {
        color: 'white',
        fontSize: '20px',
    },
}));