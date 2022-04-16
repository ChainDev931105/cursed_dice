import { Typography, Grid, Switch } from "@mui/material";
import { Box } from "@mui/system";
import React, { FC } from "react";
import { SolanaZionSelectorInterface } from "../interfaces/SolanaZionSelectorInterface";

import solana from '../assets/solana.png';
import zion from '../assets/zion.png';

const SolanaZionSelector: FC<SolanaZionSelectorInterface> = ({zionSelected, setSelected}) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(!zionSelected)
      };

    return (
        <Grid container spacing={0} sx={{paddingBottom:'1em'}}>
            <Grid item xs={5} sx={{}}>
                <Grid container spacing={0}>
                    <Grid item xs={3}>
                        <Box component='img' src={solana} sx={{width:"100%", transform: 'translate(0, 0.3em)'}} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h5" sx={{color:'white', fontFamily: "'Poppins', sans-serif", fontWeight:800, paddingLeft:'0.2em'}}>
                            Solana
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={2} sx={{}}>
                <Switch checked={zionSelected} onChange={handleChange} />
            </Grid>
            <Grid item xs={5} sx={{paddingLeft:'1em'}}>
                <Grid container spacing={0}>
                    <Grid item xs={3}>
                        <Box component='img' src={zion} sx={{width:"100%", transform: 'translate(0, 0.3em)'}} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h5" sx={{color:'white', fontFamily: "'Poppins', sans-serif", fontWeight:800, paddingLeft:'0.2em'}}>
                            Zion
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default SolanaZionSelector