import { Button } from "@mui/material";
import { styled } from '@mui/material/styles';

const FlatButton = styled(Button)({
    background:"rgba(25,25,25,0.7)",
    borderRadius: 10,
    textAlign: "center",
    boxShadow: "none", 
    fontSize: '20px',
    fontFamily: "'Poppins', sans-serif",
    color: "white",
    fontWeight: 800 ,
    backdropFilter: "blur(5px)",
    letterSpacing: "0px",
    '.MuiButton-text' : {
        textAlign:"center"
    }

})

export default FlatButton;