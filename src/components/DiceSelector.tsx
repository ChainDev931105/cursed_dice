import { FC } from "react";

import { Grid, IconButton } from "@mui/material";
import { Box } from "@mui/system";

import { DiceSelectorInterface } from "../interfaces/DiceSelectorInterface";

import dice1 from '../assets/dice/dice1.png';
import dice2 from '../assets/dice/dice2.png';
import dice3 from '../assets/dice/dice3.png';
import dice4 from '../assets/dice/dice4.png';
import dice5 from '../assets/dice/dice5.png';
import dice6 from '../assets/dice/dice6.png';

import dice1_selected from '../assets/dice/dice1_selected.png';
import dice2_selected from '../assets/dice/dice2_selected.png';
import dice3_selected from '../assets/dice/dice3_selected.png';
import dice4_selected from '../assets/dice/dice4_selected.png';
import dice5_selected from '../assets/dice/dice5_selected.png';
import dice6_selected from '../assets/dice/dice6_selected.png';

const DiceGridStyles = {
    paddingTop: "0.2em",
}

const MobileDiceStyles = {
    width: "100%"
}

const DiceSelector: FC<DiceSelectorInterface> = ({ selectedDice, setSelected, desktop }) => {

    function setSelectedDice(index: number): void {
        let dice_count = 0
        let temp = [...selectedDice]
        for (let i = 0; i < selectedDice.length; i++) {
            if (selectedDice[i]) {
                dice_count++
            }
        }
        if (dice_count === 3 && !selectedDice[index]) {
            for (let i = 0; i < selectedDice.length; i++) {
                if (selectedDice[i]) {
                    temp[i] = false;
                    break;
                }
            }
        }
        temp[index] = !temp[index]
        setSelected(temp)
    }

    if (desktop) {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} >
                    <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(0)}>
                        <Box component='img' src={selectedDice[0] ? dice1_selected : dice1} sx={MobileDiceStyles} />
                    </IconButton>
                </Grid>
                <Grid item xs={12} >
                    <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(1)}>
                        <Box component='img' src={selectedDice[1] ? dice2_selected : dice2} sx={MobileDiceStyles} />
                    </IconButton>
                </Grid>
                <Grid item xs={12} >
                    <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(2)}>
                        <Box component='img' src={selectedDice[2] ? dice3_selected : dice3} sx={MobileDiceStyles} />
                    </IconButton>
                </Grid>
                <Grid item xs={12} >
                    <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(3)}>
                        <Box component='img' src={selectedDice[3] ? dice4_selected : dice4} sx={MobileDiceStyles} />
                    </IconButton>
                </Grid>
                <Grid item xs={12} >
                    <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(4)}>
                        <Box component='img' src={selectedDice[4] ? dice5_selected : dice5} sx={MobileDiceStyles} />
                    </IconButton>
                </Grid>
                <Grid item xs={12} >
                    <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(5)}>
                        <Box component='img' src={selectedDice[5] ? dice6_selected : dice6} sx={MobileDiceStyles} />
                    </IconButton>
                </Grid>
            </Grid>
        )
    } else {
        return (
            <Box sx={{ borderRadius: 6, border: "4px solid #656568", backdropFilter: "blur(15px)", padding: "0.5em" }}>
                <Grid container spacing={1}>
                    <Grid item xs={2} >
                        <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(0)}>
                            <Box component='img' src={selectedDice[0] ? dice1_selected : dice1} sx={MobileDiceStyles} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={2} >
                        <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(1)}>
                            <Box component='img' src={selectedDice[1] ? dice2_selected : dice2} sx={MobileDiceStyles} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={2} >
                        <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(2)}>
                            <Box component='img' src={selectedDice[2] ? dice3_selected : dice3} sx={MobileDiceStyles} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={2} >
                        <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(3)}>
                            <Box component='img' src={selectedDice[3] ? dice4_selected : dice4} sx={MobileDiceStyles} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={2} >
                        <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(4)}>
                            <Box component='img' src={selectedDice[4] ? dice5_selected : dice5} sx={MobileDiceStyles} />
                        </IconButton>
                    </Grid>
                    <Grid item xs={2} >
                        <IconButton sx={DiceGridStyles} onClick={() => setSelectedDice(5)}>
                            <Box component='img' src={selectedDice[5] ? dice6_selected : dice6} sx={MobileDiceStyles} />
                        </IconButton>
                    </Grid>
                </Grid>
            </Box>
        )
    }
}

export default DiceSelector;