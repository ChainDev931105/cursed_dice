import { FC, useState } from "react";
import { Box } from "@mui/system";
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";

import cursed_dice_logo from "../assets/cursed_dice_logo.png";
import connect_wallet from "../assets/connect_wallet.png"
import connect_wallet_connected from "../assets/connect_wallet_connected.png"
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-material-ui";

import { HeaderInterface } from "../interfaces/HeaderInterface";


const MobileHeader: FC = () => {
    const [open, setOpen] = useState(false);
    const { connected } = useWallet();
    return (
        <Box sx={{ flexGrow: 1, }}>
            <AppBar
                position="static"
                sx={{
                    background: "transparent",
                    boxShadow: "none",
                    paddingTop: "1em",
                }}
            >
                <Toolbar>
                    <IconButton
                        size="large"
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        sx={{ mr: 2, paddingLeft: { md: "2em", xs: "0em" }, display: { xs: "none", md: "block" } }}
                    >
                        <Box
                            component="img"
                            sx={{ width: "60%" }}
                            alt="Cursed dice logo"
                            src={cursed_dice_logo}
                        />
                    </IconButton>
                    <Typography sx={{ flexGrow: 1 }} component="div" />

                    <WalletMultiButton
                        aria-label="menu"
                        style={{
                            display: "flex",
                            color: "#0C0E31",
                            backgroundColor: "rgb(223, 196, 139)",
                            fontWeight: 800,
                            fontFamily: "'Poppins', sans-serif",
                            borderRadius: "1rem", 
                            border: "4px solid #000000",
                            fontSize: "2rem",
                          }}
                    >
                        {connected ? "Connected" : "Connect"}
                    </WalletMultiButton>
                </Toolbar>

            </AppBar>
        </Box>
    )
}

export default MobileHeader;