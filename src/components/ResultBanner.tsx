import { FC} from "react";
import React from "react";
import { ResultsInterface } from "../interfaces/ResultsInterface";

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import { Typography, Button, Grid } from "@mui/material";
import FlatButton from "./FlatButton";
import { Box } from "@mui/system";

import solana from "../assets/solana.png";
import zion from "../assets/zion.png";

const ResultBanner: FC<ResultsInterface> = ({won, amount, sol, open, setOpen}) => {

    const handleClose = () => {
        setOpen(false);
    }

    function getShareURL(): string {
        const description = `I just ${won? 'won' : 'lost'} ${amount} ${sol ? 'sol' : 'Zion'} on cursed dice at www.curseddice.com `

        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(description.trim())}`
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{style:{backgroundColor: won? "rgba(136, 223, 204,0.6)" : "rgba(133,154,188,0.6)",  borderRadius: 26, border: "4px solid #0d5545", backdropFilter: "blur(15px)"}}}>
                <DialogContent sx={{textAlign:"center"}}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sx={{paddingBottom:"1em"}}>
                            <Typography variant="h6" sx={{fontFamily: "'Poppins', sans-serif", fontWeight: 800, fontSize:"3em", color:"white" }}>
                                {won? "You Just Won the Bet" : "You Just Lost the Bet"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} sx={{paddingBottom:"1em"}}>
                            <Typography variant="h6" sx={{fontFamily: "'Poppins', sans-serif", fontWeight: 300, fontSize:"2.5em", color:"white" }} >
                                {won? "Congrats you just won": "Unfortunately you just lost"} {amount} {sol? "Sol" : "Zion"}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} >
                            <Grid container spacing={0} sx={{width:"12em", margin:"auto", paddingBottom:"1em"}}>
                                <Grid item xs={6}>
                                    <Box component='img' src={sol? solana : zion} sx={{width:"2.5em", transform:"translate(0, 0.6em)"}} />
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h6" sx={{fontFamily: "'Poppins', sans-serif", fontWeight: 300, color: won ? "rgb(91,195,163)" : "rgb(145,23,27)", fontSize:"2.5em"}}>
                                        {won? "+" : "-"} {amount} 
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <FlatButton sx={{width:"100%"}} variant="contained" color="secondary" onClick={handleClose}>Roll Again</FlatButton>
                        </Grid>
                        <Grid item xs={12}>
                            <FlatButton sx={{width:"100%"}} variant="contained" color="secondary" href={getShareURL()}>Share</FlatButton>
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>            
        </React.Fragment>
    )
}

export default ResultBanner;