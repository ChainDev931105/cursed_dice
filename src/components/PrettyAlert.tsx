import { FC } from "react";
import React from "react";
import { PrettyAlertInterface } from "../interfaces/PrettyAlertInterface";

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import {Typography} from "@mui/material";


const PrettyAlert: FC<PrettyAlertInterface> = ({ open, setOpen, text }) => {

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <React.Fragment>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" PaperProps={{ style: { backgroundColor: "rgba(136, 223, 204,0.6)", borderRadius: 26, border: "4px solid #0d5545", backdropFilter: "blur(15px)" } }}>
                <DialogContent sx={{ textAlign: "center" }}>
                    <Typography variant="h6" sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 300}}>
                        {text}
                    </Typography>
                </DialogContent>
            </Dialog>
        </React.Fragment>
    )
}

export default PrettyAlert;