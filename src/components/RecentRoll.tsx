import React, { FC } from "react";
import { RecentRollsInterface } from "../interfaces/RecentRollsInterface";
import { Typography, Box, Grid, Divider } from "@mui/material";
import {getTxnExplorerLink, getWalletExplorerLink} from "../Helpers/Helpers";


const TextProps = {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 200,
    color: "white",
    width: "100%",
    overflow: "hidden",
    underline: "none",
    textDecoration: "none",
    fontSize: "14px"
}

const RecentRoll: FC<RecentRollsInterface> = ({ user, result, amount, network, deposit_txn }) => {

    const walletLink = () => {
        return getWalletExplorerLink(user, network);
    }
    const transactionLink = () => {
        return getTxnExplorerLink(deposit_txn, network);
    }
    const resultLink = () => {
        return getTxnExplorerLink(deposit_txn, network);
    }

    function formatAddress(address: string): string {
        return address.slice(0, 6) + "..."
    }

    return (
        <Box component="div">
            <Grid container spacing={2} sx={{paddingTop: "0em",alignItems: "center", textAlign: "center" }}>
                <Grid item xs>
                    <a href={walletLink()} style={TextProps} target="_blank">
                        ({formatAddress(user)} rolled for
                    </a>
                    <a href={transactionLink()} style={TextProps} target="_blank">
                        {` ${amount}`} and &nbsp;
                    </a>
                    <a href={resultLink()} style={TextProps} target="_blank">
                        {result}).
                    </a>
                    <Box sx={{paddingTop:'0.5em'}}>
                        <Divider sx={{borderBottomWidth: 3, width: '80%', margin: 'auto', background:"#656568" }} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default RecentRoll;