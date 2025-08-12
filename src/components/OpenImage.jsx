import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import logoImg from "../assets/logo.jpeg";

const OpenImage = ({ openImg, setOpenImg }) => {

    const handleClose = () => {
        setOpenImg(false);
    };

    return (
        <>
            <Dialog open={openImg} onClose={handleClose}>
                <DialogContent>
                    <img src={logoImg} className='object-contain w-[300px] md:w-[400px]' />
                </DialogContent>
                <DialogActions>
                <Button style={{color:"#F75E69"}} onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default OpenImage