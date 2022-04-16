import {useParams} from "react-router-dom";
import {Button, Grid, TextField} from "@mui/material";
import {useEffect, useState} from "react";
import {AccountData, Accounts, House} from "../Types/Types";
import {fetchDataUtil, postDataUtil} from "../Helpers/Helpers";
import ApiRoutes from "../ApiRoutes/ApiRoutes";
import {Case, Switch} from "react-if";
import {WalletDisconnectButton, WalletMultiButton} from "@solana/wallet-adapter-material-ui";
import {useAnchorWallet, useWallet} from "@solana/wallet-adapter-react";
import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {getUrl} from "../Helpers/Settings";
import {
    deposit,
    getTokenAccount,
    loadProgram,
    processTransaction,
    register, withdraw
} from "../CoinFlip/Coin-Flip";
import * as anchor from "@project-serum/anchor";
import {NATIVE_MINT} from "@solana/spl-token";
import Paper from "@mui/material/Paper";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";

const AdminUpdate = () => {
    const anchorWallet = useAnchorWallet();
    const {wallet, publicKey, signTransaction} = useWallet();
    const {admin, program} = useParams();
    const [house, setHouse] = useState<House>();
    const [connection, setConnection] = useState<Connection>();
    const [url, setUrl] = useState<string>();
    const [accounts, setAccounts] = useState<Accounts>({});
    const [anchorProgram, setAnchorProgram] = useState<anchor.Program>();
    const [amounts, setAmounts] = useState<object>({});
    const [newMint, setNewMint] = useState<string>();
    const [newDeposit, setNewDeposit] = useState<number>();
    const [allowed, setAllowed] = useState<number[]>([]);
    const [allowedString, setAllowedString] = useState<string>();

    useEffect(() => {
        (async () => {
            const tmpHouse = await fetchDataUtil(ApiRoutes.getHouse + `/${admin}/${program}`);
            if (tmpHouse && tmpHouse.url) {
                setHouse(tmpHouse);
                if (!url) {
                    setUrl(tmpHouse.url);
                    setConnection(new Connection(tmpHouse.url));
                }
            }
        })();
    }, []);

    async function getAccountBalance(accountProgram: string, accountMint: string, accountAdmin: string, accountConnection: Connection): Promise<AccountData> {
        console.log(`uzz accountProgram => ${accountProgram} | accountMint => ${accountMint} | accountAdmin => ${accountAdmin}`);
        const isNative = accountMint === NATIVE_MINT.toBase58();
        const account = await getTokenAccount(new PublicKey(accountAdmin), new PublicKey(accountMint), new PublicKey(accountProgram));
        let balance;
        if (isNative) {
            balance = await accountConnection.getBalance(account);
        } else {
            balance = (await accountConnection.getTokenAccountBalance(account)).value.uiAmount || 0;
        }
        return {
            publicKey: account.toBase58(),
            mint: accountMint,
            balance: balance / (isNative ? LAMPORTS_PER_SOL : 1)
        };
    }

    const updateAmount = (mint: string, amount: number) => {
        setAmounts({...amounts, [mint]: amount});
    }

    useEffect(() => {
    }, [house, publicKey, connection, url, wallet, signTransaction, anchorWallet, accounts]);

    useEffect(() => {
        (async () => {
            if (connection && anchorWallet && house) {
                // setHouse(tmpHouse);
                const houseProgram = await loadProgram(new PublicKey(house.program_id), connection, anchorWallet);
                setAnchorProgram(houseProgram);
                const tmpAccounts: Accounts = {}
                for (const mint of house.mints) {
                    const account = await getAccountBalance(house.program_id, mint, house.admin, connection);
                    console.log(`x account => ${JSON.stringify(account, null, 2)}`)
                    console.log(`y mint => ${mint}`)
                    tmpAccounts[mint] = account;
                }
                console.log(`tmpAccounts => ${JSON.stringify(tmpAccounts, null, 2)}`)
                setAccounts(tmpAccounts);
            }
        })()
    }, [connection, url, anchorWallet, house]);


    const runDeposit = async (mint: string) => {
        if (!house) {
            alert("No house");
            return;
        }
        if (!anchorProgram) {
            alert("No anchorProgram");
            return;
        }
        if (!connection) {
            alert("no connection");
            return;
        }
        if (!publicKey || !signTransaction) {
            alert("Connect wallet");
            return;
        }
        if (publicKey.toBase58() !== house.admin) {
            alert("Admin isn't connected wallet");
            return;
        }

        // @ts-ignore
        const instruction = await deposit(new PublicKey(house?.admin), new PublicKey(mint), amounts[mint], anchorProgram);
        const txnResult = await processTransaction([instruction], connection, publicKey, signTransaction);
        console.log(`txnResult => ${JSON.stringify(txnResult, null, 2)}`);
        alert(`see txn => ${txnResult.Signature}`);
    }

    const runRegister = async () => {
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
        if (!house) {
            alert("No house");
            return;
        }
        if (!anchorProgram) {
            alert("No anchorProgram");
            return;
        }
        if (!connection) {
            alert("no connection");
            return;
        }
        if (!publicKey || !signTransaction) {
            alert("Connect wallet");
            return;
        }
        if (publicKey.toBase58() !== house.admin) {
            alert("Admin isn't connected wallet");
            return;
        }
        if (!newMint) {
            alert("No new mint");
            return;
        }
        if (!newDeposit) {
            alert("No new deposit");
            return;
        }

        const instructions = [];
        instructions.push(await register(new PublicKey(house?.admin), new PublicKey(newMint), anchorProgram, allowedParsed));
        instructions.push(await deposit(new PublicKey(house?.admin), new PublicKey(newMint), newDeposit, anchorProgram));
        const txnResult = await processTransaction(instructions, connection, publicKey, signTransaction);
        console.log(`txnResult => ${JSON.stringify(txnResult, null, 2)}`);
        const addedMint = await postDataUtil(ApiRoutes.addMint, {
            admin: admin,
            program: program,
            mint: newMint,
            allowed: allowedParsed
        });
        console.log(`addedMint ${JSON.stringify(addedMint, null, 2)}`);
    }

    const runWithdraw = async (mint: string) => {
        if (!house) {
            alert("No house");
            return;
        }
        if (!anchorProgram) {
            alert("No anchorProgram");
            return;
        }
        if (!connection) {
            alert("no connection");
            return;
        }
        if (!publicKey || !signTransaction) {
            alert("Connect wallet");
            return;
        }
        if (publicKey.toBase58() !== house.admin) {
            alert("Admin isn't connected wallet");
            return;
        }

        // @ts-ignore
        const instruction = await withdraw(new PublicKey(house?.admin), new PublicKey(mint), amounts[mint], anchorProgram);
        const txnResult = await processTransaction([instruction], connection, publicKey, signTransaction);
        console.log(`txnResult => ${JSON.stringify(txnResult, null, 2)}`);
        alert(`see txn => ${txnResult.Signature}`);
    }

    return (
        <div>
            <Grid container spacing={3} sx={{
                width: "95%",
                margin: 'auto',
                backgroundColor: "rgba(255,255,255, 0.3)",
                backdropFilter: "blur(15px)"
            }}>
                <Grid container spacing={3} sx={{
                    width: "95%",
                    margin: 'auto',
                    backgroundColor: "rgba(255,255,255, 0.3)",
                    backdropFilter: "blur(15px)"
                }}>
                    <Switch>
                        <Case condition={!publicKey}>
                            <Grid item xs={12}><WalletMultiButton/></Grid>
                        </Case>
                        <Case condition={publicKey !== null}>
                            <Grid item xs={12}><WalletDisconnectButton/></Grid>
                            <Grid item xs={12}><h4>Connected : {publicKey?.toBase58()}</h4></Grid>
                            <Grid item xs={12}><h4>Admin : {admin}</h4></Grid>
                            <Grid item xs={12}><h4>Solana network URL: {url}</h4></Grid>
                            <Grid item xs={12}><h4>Solana Program: {program}</h4></Grid>
                            <Grid container spacing={4}>
                                <Grid item xs={3}><Button variant="contained" sx={{width: "100%"}}
                                                          onClick={runRegister}>Register</Button></Grid>
                                <Grid item xs={9}>
                                    <TextField label="mint"
                                               fullWidth
                                               variant="filled"
                                               value={newMint}
                                               onChange={e => setNewMint(e.target.value)}/>
                                </Grid>
                                <Grid item xs={3}><Button variant="contained"
                                                          sx={{width: "100%"}}>Deposit</Button></Grid>
                                <Grid item xs={9}>
                                    <TextField label="amount"
                                               fullWidth
                                               variant="filled"
                                               value={newDeposit}
                                               onChange={e => setNewDeposit(parseFloat(e.target.value))}/>
                                </Grid>
                                <Grid item xs={3}><Button variant="contained" sx={{width: "100%"}}>Allowed Bets</Button>
                                </Grid>
                                <Grid item xs={9}>
                                    <TextField label="allowed bets" fullWidth variant="filled" value={allowedString}
                                               onChange={e => setAllowedString(e.target.value)}/>
                                </Grid>

                            </Grid>
                            <Grid item xs={12}>
                                <TableContainer component={Paper}>
                                    <Table sx={{minWidth: 650}} aria-label="simple table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Deposit</TableCell>
                                                <TableCell>Withdraw</TableCell>
                                                <TableCell align="right">Balance</TableCell>
                                                <TableCell align="right">Account</TableCell>
                                                <TableCell align="right">Sum</TableCell>
                                                <TableCell align="right">Mint</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {Object.values(accounts).map((account: AccountData, key: number) =>
                                                <TableRow
                                                    sx={{'&:last-child td, &:last-child th': {border: 0}}}
                                                    key={key}>
                                                    <TableCell component="th" scope="row">
                                                        <Button variant="contained" sx={{width: "100%"}}
                                                                onClick={() => runDeposit(account.mint)}>Deposit</Button>

                                                    </TableCell>
                                                    <TableCell align="right"><Button variant="contained"
                                                                                     onClick={() => runWithdraw(account.mint)}
                                                                                     sx={{width: "100%"}}>Withdraw</Button></TableCell>
                                                    <TableCell align="right">{account.balance}</TableCell>
                                                    <TableCell align="right">{account.publicKey}</TableCell>
                                                    <TableCell align="right">
                                                        <TextField label="amount"
                                                                   type={"number"}
                                                                   fullWidth
                                                                   variant="filled"
                                                            // @ts-ignore
                                                                   value={amounts[account.mint]}
                                                                   onChange={e => updateAmount(account.mint, parseFloat(e.target.value))}/>
                                                    </TableCell>
                                                    <TableCell align="right">{account.mint}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Grid>
                        </Case>
                    </Switch>
                </Grid>
            </Grid>
        </div>
    )
}

export default AdminUpdate;