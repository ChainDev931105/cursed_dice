import {FC, useEffect, useState} from 'react';
import { TextField, Grid, Button } from '@mui/material';
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-material-ui";
import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import {useAnchorWallet, useWallet} from "@solana/wallet-adapter-react";
import {NATIVE_MINT} from "@solana/spl-token";
import {getProgram, getUrl} from "../Helpers/Settings";
import {CreateHouse, House} from "../Types/Types";
import ApiRoutes from "../ApiRoutes/ApiRoutes";
import {fetchDataUtil, postDataUtil} from "../Helpers/Helpers";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Switch, Case} from 'react-if';
import {createHouse, loadProgram, processTransaction} from "../CoinFlip/Coin-Flip";
import {getCoreState, getVaultAuth} from "../CoinFlip/coin-flip_pda";

const Admin:FC = () => {
    const [fee, setFee] = useState<number>();
    // const [depositAddr, setDepositAddr] = useState('')
    const [depositAmt, setDepositAmt] = useState<number>();
    const [withDrawAmt, setWithdrawAmt] = useState<number>();
    // const [withdrawAddr, setWidthdrawAddr] = useState('')
    const anchorWallet = useAnchorWallet();
    const {wallet, publicKey, signTransaction} = useWallet();
    const [program, setProgram] = useState<anchor.Program>();
    const [mint, setMint] = useState<string>(NATIVE_MINT.toBase58());
    const [url, setUrl] = useState<string>();
    const [program_id, setProgramId] = useState<string>();
    const [connection, setConnection] = useState<Connection>();
    const [houses, setHouses] = useState<House[]>([]);
    const [allowed, setAllowed] = useState<number[]>([]);
    const [allowedString, setAllowedString] = useState<string>();
    const [executer, setExecuter] = useState<string>("42EqwB9yGMFf1euQde7nbAnbcDXvBjjdQ9fXUKv93f1y");
    const [ratio , setRatio] = useState<number>();

    useEffect(() => {
        if (url) {
            setConnection(new Connection(url))
        }
    }, [url]);

    useEffect(() => {
        (async() => {
            const tmpHouses = await fetchDataUtil(ApiRoutes.getAllHouses);
            if (tmpHouses) {
                setHouses(tmpHouses);
            }
            const tmpUrl = await getUrl();
            if (tmpUrl) {
                setUrl(tmpUrl);
            }
        })()
    }, []);

    useEffect(() => {
        (async() => {
            const tmpProgramId = await getProgram();
            if (tmpProgramId) {
                setProgramId(tmpProgramId);
            }
        })()
    }, []);

    useEffect(() => {
        (async () => {
            if (anchorWallet && program_id && connection) {
                setProgram(await loadProgram(new PublicKey(program_id), connection, anchorWallet));
            }
            if (!executer && publicKey) {
                setExecuter(publicKey.toBase58());
            }
        })()
    }, [wallet, publicKey, anchorWallet, connection, url, program_id]);

    const runCreateHouse = async () => {
        if (!executer) {
            alert("No executer");
            return;
        }

        if (!ratio) {
            alert("No ratio");
            return;
        }

        if (!allowedString) {
            alert("Add allowed bets");
            return;
        }

        let allowedParsed;
        try {
            allowedParsed = JSON.parse(allowedString).map((i: number) => i * LAMPORTS_PER_SOL);
        } catch (e: any) {
            alert("Malformed allowed bets");
            return;
        }

        setAllowed(allowedParsed);

        if (allowedParsed.length === 0) {
            alert("Add allowed bets");
            return;
        }
        if (!publicKey) {
            alert("Please connect wallet");
            return;
        }
        if (!connection) {
            alert("No connection found");
            return;
        }

        if (!program) {
            alert("No program found");
            return;
        }
        if (!fee) {
            alert("Please set fees");
            return;
        }
        if (!signTransaction) {
            alert("Please connect wallet");
            return;
        }
        if (!mint) {
            alert("Please input mint");
            return;
        }
        if (!depositAmt) {
            alert("Cannot create a house without depositing to it");
            return;
        }
        if (!url) {
            alert("No URL");
            return;
        }

        const createHouseProps: CreateHouse = {
            admin: publicKey,
            core: (await getCoreState(program.programId, publicKey))[0],
            vault: (await getVaultAuth(program.programId, publicKey))[0],
            mint: new PublicKey(mint),
            program: program,
            fee: fee,
            allowed: allowedParsed,
            executer: new PublicKey(executer),
            ratio: ratio,
            deposit: depositAmt,
            url: url
        }

        const createHousePropsForDb = {
            admin: createHouseProps.admin.toBase58(),
            core: createHouseProps.core.toBase58(),
            vault: createHouseProps.vault.toBase58(),
            mint: createHouseProps.mint.toBase58(),
            program_id: createHouseProps.program.programId.toBase58(),
            fee: createHouseProps.fee,
            allowed: createHouseProps.allowed,
            executer: createHouseProps.executer.toBase58(),
            ratio: createHouseProps.ratio,
            url: createHouseProps.url
        }

        console.log(`createHouseProps:\n${JSON.stringify(createHousePropsForDb, null, 2)}`);

        const instructions = await createHouse(createHouseProps);
        const results = await processTransaction(instructions, connection, publicKey, signTransaction);
        if (results.SignatureResult.err === null) {
            await postDataUtil(ApiRoutes.createHouse, createHousePropsForDb);
            alert(`Created house :\n${JSON.stringify(createHousePropsForDb, null, 2)}`);
        } else {
            alert(`Failed to create house`);
        }

    }

    return (
        <Grid container spacing={3} sx={{width:"95%", margin:'auto', backgroundColor:"rgba(255,255,255, 0.3)", backdropFilter: "blur(15px)" }}>
            <Switch>
                <Case condition={!publicKey}>
                    <Grid item xs={12}>
                        <WalletMultiButton />
                    </Grid>
                </Case>
                <Case condition={publicKey !== null}>
                    <Grid item xs={12}>
                        <WalletDisconnectButton />
                    </Grid>
                    <Grid item xs={6}>
                        <h4>Solana network URL: {url}</h4>
                    </Grid>
                    <Grid item xs={6}>
                        <h4>Solana Program: {program?.programId.toBase58()}</h4>
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" sx={{width:"100%"}}>
                            Initialise
                        </Button>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField label="fee percent" type={"number"} fullWidth variant="filled" value={fee} onChange={e => setFee(parseFloat(e.target.value))} />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" sx={{width:"100%"}}>
                            Register SPL
                        </Button>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField label="mint address" fullWidth variant="filled" value={mint} onChange={e => setMint(e.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" sx={{width:"100%"}}>
                            Executer
                        </Button>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField label="executer" fullWidth variant="filled" value={executer} onChange={e => setExecuter(e.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" sx={{width:"100%"}}>
                            Allowed Bets
                        </Button>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField label="allowed bets" fullWidth variant="filled" value={allowedString} onChange={e => setAllowedString(e.target.value)} />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" sx={{width:"100%"}}>
                            Deposit
                        </Button>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField variant="filled" label="amount" type={"number"} fullWidth value={depositAmt} onChange={e => setDepositAmt(parseFloat(e.target.value))} />
                    </Grid>
                    <Grid item xs={3}>
                        <Button variant="contained" sx={{width:"100%"}}>
                            Ratio
                        </Button>
                    </Grid>
                    <Grid item xs={9}>
                        <TextField variant="filled" label="ratio" type={"number"} fullWidth value={ratio} onChange={e => setRatio(parseFloat(e.target.value))} />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant={"contained"} onClick={runCreateHouse}>Create House</Button>
                    </Grid>
                </Case>
            </Switch>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>View</TableCell>
                                <TableCell>Admin</TableCell>
                                <TableCell align="right">Fee</TableCell>
                                <TableCell align="right">Core</TableCell>
                                <TableCell align="right">Vault</TableCell>
                                <TableCell align="right">Program</TableCell>
                                <TableCell align="right">Executer</TableCell>
                                <TableCell align="right">Ratio</TableCell>
                                <TableCell align="right">Mints</TableCell>
                                <TableCell align="right">Allowed Bets</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {houses.map((house: House, key: number) => (
                                <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component="th" scope="row">
                                        <Button variant={"outlined"} onClick={() => window.open(`/view-house/${house.admin}/${house.program_id}`)}>View</Button>
                                    </TableCell>
                                    <TableCell align="right">{house.admin}</TableCell>
                                    <TableCell align="right">{house.fee}</TableCell>
                                    <TableCell align="right">{house.core}</TableCell>
                                    <TableCell align="right">{house.vault}</TableCell>
                                    <TableCell align="right">{house.program_id}</TableCell>
                                    <TableCell align="right">{house.executer}</TableCell>
                                    <TableCell align="right">{house.ratio}</TableCell>
                                    <TableCell align="right"><pre>{JSON.stringify(house.mints, null, 2)}</pre></TableCell>
                                    <TableCell align="right"><pre>{JSON.stringify(house.allowed_bets, null, 2)}</pre></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    )
}

export default Admin;