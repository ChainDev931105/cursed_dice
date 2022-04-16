import React, {FC, useEffect, useState} from "react";
import "./home.css";
import * as anchor from "@project-serum/anchor";
import {Connection, LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {useAnchorWallet, useWallet} from "@solana/wallet-adapter-react";
import {getNetwork, getUrl} from "../Helpers/Settings";
import {bet, loadProgram, processTransaction, sleep} from "../CoinFlip/Coin-Flip";
import {fetchDataUtil, postDataUtil} from "../Helpers/Helpers";
import ApiRoutes from "../ApiRoutes/ApiRoutes";

import {Grid, IconButton, Typography} from "@mui/material";
import {Box} from "@mui/system";
import {CustomSlider} from "../components/CustomSlider";

import DiceSelector from "../components/DiceSelector";

import SolanaZionSelector from "../components/SolanaZionSelector";
import {RecentRollsInterface} from "../interfaces/RecentRollsInterface";
import RecentRoll from "../components/RecentRoll";

import roll from '../assets/roll.png'
import MobileHeader from "../components/MobileHeader";
import ResultBanner from "../components/ResultBanner";
import PrettyAlert from "../components/PrettyAlert";
import {getAssociatedTokenAddress, NATIVE_MINT} from "@solana/spl-token";
import {Bet, House, SolanaNetwork} from "../Types/Types";
import {getBetState, getCoreState} from "../CoinFlip/coin-flip_pda";

const rolling_dice = "https://res.cloudinary.com/dtgfpjvoi/image/upload/v1648999969/cursed_dic/rolling_dice_fast_e58vhk.gif";
const rolling_dice_initial = "https://res.cloudinary.com/dtgfpjvoi/image/upload/v1648999968/cursed_dic/rolling_dice_initial_v60xnz.gif";

const SliderMarksStyles = {
    color: "white",
    paddingTop: "4em",
    fontFamily: "'Poppins', sans-serif",
    paddingLeft: "0.5em",
    fontWeight: 800
}

const SliderMarksStylesMobile = {
    fontWeight: 800,
    fontFamily: "'Poppins', sans-serif",
    color: 'white',
    paddingTop: '1em',
    textAlign: "center",
}

const Home: FC = () => {
    const anchorWallet = useAnchorWallet();
    const {wallet, publicKey, signTransaction} = useWallet();
    const [program, setProgram] = useState<anchor.Program>();
    const [mint, setMint] = useState<PublicKey>();
    const [admin, setAdmin] = useState<PublicKey>();
    const [betSum, setBetSum] = useState<number>(0.1);
    const [url, setUrl] = useState<string>();
    const [connection, setConnection] = useState<Connection>();
    const [sliderIndex, setSliderIndex] = useState<number>(0)
    const [selectedDice, setSelectedDice] = useState<boolean[]>([false, false, false, false, false, false])

    const [executor, setExecutor] = useState<string>();
    const [zionSelected, setZionSelected] = useState<boolean>(false);
    const [rolling, setRolling] = useState<boolean>(false)
    const [recentRolls, setRecentRolls] = useState<RecentRollsInterface[]>([]);
    const [won, setWon] = useState<boolean>(false)
    const [prevWonAmount, setPrevWonAmount] = useState<number>(0)
    const [bannerOpen, setBannerOpen] = useState<boolean>(false)
    const [prettyAlertOpen, setPrettyAlertOpen] = useState<boolean>(false)
    const [alertText, setAlertText] = useState<string>('');
    const [network, setNetwork] = useState<string>();
    const [betIds, setBetIds] = useState<object>({});
    const [isInterval, setIsInterval] = useState<boolean>(false);

    const solValues = [5, 3, 2, 1, 0.5, 0.1]
    const zionValues = [10000, 7500, 5000, 1000, 500, 100]

    function Alert(text:string) {
        setAlertText(text);
        setPrettyAlertOpen(true);
    }

    function calcDice(selectedDices: boolean[]): {sum: number, selected: number} {
        const diceValues = [1, 2, 3, 4, 5, 6];
        let sum = 0;
        let selected = 0;
        for (let i = 0; i < selectedDices.length ; i++) {
            const selectedDice = selectedDices[i];
            const value = diceValues[i];
            if (selectedDice) {
                selected += 1;
                sum += value;
            }
        }
        return {sum: sum, selected: selected};
    }

    const getBets = async () => {
        const bets = await postDataUtil(ApiRoutes.getRecentBets, {});
        if (bets && !bets.errorMessage) {
            setRecentRolls(bets);
        }
    }

    function calculateSliderValue(value: number): number {
        if (zionSelected) {
            return zionValues[value]
        } else {
            return solValues[value];
        }
    }

    const handleChange = (event: Event, newValue: number | number[]) => {
        if (typeof newValue === 'number') {
            console.log(calculateSliderValue(newValue))
            setSliderIndex(newValue);
            setBetSum(calculateSliderValue(newValue));
        }
    };

    useEffect(() => {
        if (url) {
            setConnection(new Connection(url))
        }
    }, [url]);

    useEffect(() => {
        (async() => {
            await getBets();
            const tmpUrl = await getUrl();
            if (tmpUrl) {
                setUrl(tmpUrl);
            }
            const tmpNetwork = await getNetwork();
            if (tmpNetwork) {
                setNetwork(tmpNetwork);
            }
        })()
    }, []);

    useEffect(() => {
        (async () => {
            if (!connection) return;
            if (!anchorWallet) return;
            const house: House = await postDataUtil(ApiRoutes.getLatestActiveHouse, { sort: 'DESC' });
            console.log(`house => ${JSON.stringify(house, null, 2)}`)
            const houseAdmin = new PublicKey(house.admin);
            let houseMint: PublicKey;
            if (zionSelected) {
                // @ts-ignore
                houseMint = new PublicKey(house.mints.find((mint: string) => mint !== NATIVE_MINT.toBase58()));
            } else {
                // @ts-ignore
                houseMint = new PublicKey(house.mints.find((mint: string) => mint === NATIVE_MINT.toBase58()));
            }
            const houseProgramId = new PublicKey(house.program_id);
            const houseProgram = await loadProgram(houseProgramId, connection, anchorWallet);
            setAdmin(houseAdmin);
            setMint(houseMint);
            setProgram(houseProgram);
            setExecutor(house.executer);
        })()
    }, [wallet, publicKey, anchorWallet, connection, url, zionSelected]);

    async function initBet(betInfo: Bet) {
        const initBetData = await postDataUtil(ApiRoutes.initBet, betInfo);
        console.log(`initBetData:\n${JSON.stringify(initBetData, null, 2)}`);
        const limit = 10;
        let count = 0;
        while (count < limit) {
            const bet = await fetchDataUtil(ApiRoutes.getBet + `/${initBetData.id}`);
            if (bet && bet.result) {
                if (bet.result === "House Won") {
                  setPrevWonAmount(betSum);
                  setWon(true);
                  setBannerOpen(true)
                } else {
                  setPrevWonAmount(betSum);
                  setWon(false);
                  setBannerOpen(true)
                }
                break;
            } else {
                await sleep(3000);
            }
        }
    }

    const runBet = async () => {
        if (!publicKey) {
            Alert("connect wallet");
            return;
        }
        if (!anchorWallet) {
            Alert("connect wallet");
            return;
        }
        if (!program) {
            Alert("no program");
            return;
        }
        if (!admin) {
            Alert("no admin");
            return;
        }
        if (!connection) {
            Alert("no connection");
            return;
        }
        if (!mint) {
            Alert("no mint");
            return;
        }
        if (!betSum) {
            Alert("no betSum");
            return;
        }
        if (!signTransaction) {
            Alert("no signTransaction");
            return;
        }
        if (admin.toBase58() === publicKey.toBase58()) {
            Alert("Cannot use house wallet to bet, use different wallet");
            return;
        }
        if (!executor) {
            Alert("Missing executor");
            return;
        }
        let balance;
        if (zionSelected) {
            const ata = await getAssociatedTokenAddress(mint, publicKey);
            balance = (await connection.getTokenAccountBalance(ata)).value.uiAmount || 0;
        } else {
            balance = await connection.getBalance(publicKey);
        }
        console.log(`balance ${balance}`)

        if (betSum > balance / (zionSelected ? 1 : LAMPORTS_PER_SOL)) {
            Alert("no enough sol/zion in wallet");
            return;
        }

        const {sum, selected} = calcDice(selectedDice);
        if (selected !== 3) {
            Alert("Please select 3 dice");
            return;
        }

        setRolling(true);

        console.log(`admin => ${admin.toBase58()} | mint => ${mint.toBase58()} | betSum => ${betSum} | program => ${program.programId.toBase58()}`);
        const [coreState] = await getCoreState(program.programId, admin);
        const flipCounter = parseInt((await program.account.coreState.fetch(coreState)).flipCounter);
        const [betState, betStateNonce] = await getBetState(program.programId, admin, publicKey, flipCounter);

        const instructions = [];
        instructions.push(await bet(admin, publicKey, mint, betSum * LAMPORTS_PER_SOL, (sum % 2) === 0, program, flipCounter, betState, betStateNonce));

        const txnResult = await processTransaction(instructions, connection, publicKey, signTransaction);
        const result = "Rolling the dice ...";

        await initBet({
            admin: admin.toBase58(),
            program_id: program.programId.toBase58(),
            bet_state: betState.toBase58(),
            executer: executor,
            amount: betSum,
            user: publicKey.toBase58(),
            deposit_txn: txnResult.Signature,
            result_txn: '',
            mint: mint.toBase58(),
            result: '',
        });
    }

    return (
        <div>
            <PrettyAlert open={prettyAlertOpen} setOpen={setPrettyAlertOpen} text={alertText} />
            <ResultBanner won={won} amount={prevWonAmount} sol={!zionSelected} open={bannerOpen} setOpen={setBannerOpen} />
            <MobileHeader/>
            <Grid container spacing={2} sx={{ width: "95%", margin: "auto" }}>
                <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' } }}>
                    <SolanaZionSelector zionSelected={zionSelected} setSelected={setZionSelected} />
                </Grid>
                {/* Mobile view slider and dice */}
                <Grid item xs={12} sx={{ display: { md: 'none', xs: 'block' }}}>
                    <Box component="div" sx={{ width: "80%", margin: 'auto' }}>

                        <CustomSlider sx={{
                        }}
                                      aria-label="Choose Price"
                                      defaultValue={1}
                                      track={false}
                                      step={1}
                                      max={5}
                                      min={0}
                                      value={sliderIndex}
                                      scale={calculateSliderValue}
                                      onChange={handleChange}
                        />
                        <Grid container spacing={4}>
                            <Grid item xs={2}>
                                <Typography variant="h6" sx={SliderMarksStylesMobile}>
                                    {zionSelected ? 100 : 0.1}
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="h6" sx={SliderMarksStylesMobile}>
                                    {zionSelected ? 500 : 0.5}
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="h6" sx={SliderMarksStylesMobile}>
                                    {zionSelected ? 1000 : 1.0}
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="h6" sx={SliderMarksStylesMobile}>
                                    {zionSelected ? 5000 : 2.0}
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="h6" sx={SliderMarksStylesMobile}>
                                    {zionSelected ? 7500 : 3.0}
                                </Typography>
                            </Grid>
                            <Grid item xs={2}>
                                <Typography variant="h6" sx={SliderMarksStylesMobile}>
                                    {zionSelected ? 10000 : 5.0}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>
                <Grid item xs={12}  sx={{ display: { md: 'none', xs: 'block' }}}>
                    <DiceSelector selectedDice={selectedDice} setSelected={setSelectedDice} desktop={false} />
                </Grid>
                {/* Desktop view slider and dice */}
                <Grid item md={2} sm={4} xs={12} sx={{ display: { xs: 'none', sm: 'block',  md: 'block' } }}>
                    <Grid item xs={12}>
                        <SolanaZionSelector zionSelected={zionSelected} setSelected={setZionSelected} />
                    </Grid>
                    <Grid item xs={12}>
                        <Box sx={{ minHeight: "45em", width: "100%", borderRadius: 6, border: "4px solid #656568", backdropFilter: "blur(15px)" }}>
                            <Grid container spacing={1} sx={{ width: "90%", margin: "auto", paddingTop: "2em", textAlign: "center" }}>
                                <Grid item xs={6}>
                                    <Typography variant="h5" sx={{ color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
                                        Bet
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Typography variant="h5" sx={{ color: "white", fontFamily: "'Poppins', sans-serif", textAlign: "center", fontWeight: 800 }}>
                                        Dice
                                    </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                    <Grid container spacing={1} sx={{ paddingLeft: '2em' }}>
                                        <Grid item xs={4} sx={{ paddingLeft: '2em' }}>
                                            <CustomSlider sx={{
                                                '& input[type="range"]': {
                                                    WebkitAppearance: 'slider-vertical',
                                                },
                                                height: "36em",
                                            }}
                                                          aria-label="Choose Price"
                                                          orientation="vertical"
                                                          defaultValue={1}
                                                          track={false}
                                                          step={1}
                                                          max={5}
                                                          min={0}
                                                          value={sliderIndex}
                                                          scale={calculateSliderValue}
                                                          onChange={handleChange}
                                            />
                                        </Grid>
                                        <Grid item xs={2}>
                                            <Typography variant="h6" sx={{ color: "white", fontFamily: "'Poppins', sans-serif", paddingLeft: "0.5em", fontWeight: 800 }}>
                                                {zionSelected ? 100 : 0.1}
                                            </Typography>
                                            <Typography variant="h6" sx={SliderMarksStyles}>
                                                {zionSelected ? 500 : 0.5}
                                            </Typography>
                                            <Typography variant="h6" sx={SliderMarksStyles}>
                                                {zionSelected ? 1000 : 1.0}
                                            </Typography>
                                            <Typography variant="h6" sx={SliderMarksStyles}>
                                                {zionSelected ? 5000 : 2.0}
                                            </Typography>
                                            <Typography variant="h6" sx={SliderMarksStyles}>
                                                {zionSelected ? 7500 : 3.0}
                                            </Typography>
                                            <Typography variant="h6" sx={SliderMarksStyles}>
                                                {zionSelected ? 10000 : 5.0}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item xs={6}>
                                    <DiceSelector selectedDice={selectedDice} setSelected={setSelectedDice} desktop={true} />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
                <Grid item md={8} sm={6} xs={12} sx={{ alignItems: 'center', textAlign: 'center' }}>
                    <Grid container direction='row'>
                        <Grid item xs={12} sx={{ minHeight: { md: "40em", xs: "10em" } }}>
                            <Box component="img" src={rolling ? rolling_dice : rolling_dice_initial} sx={{width: {xs: "80%", md: "40%"}, margin:'auto'}} />
                        </Grid>
                        <Grid item xs={12}>
                            <IconButton sx={{ bottom: 5, }} onClick={runBet}>
                                <Box component="img" src={roll} />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item xs={12} md={2} >
                    <Box sx={{ marginTop: "3.5em", minHeight: "45em", width: "100%", borderRadius: 6, border: "4px solid #656568", backdropFilter: "blur(15px)", }}>
                        <Grid container spacing={1} sx={{ width: "100%", paddingTop: "1em", textAlign: "center" }}>
                            <Grid item xs={12}>
                                <Typography variant="h4" sx={{ color: "white", fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
                                    Recent Rolls
                                </Typography>
                            </Grid>
                            {network && recentRolls.map((recentRoll, index) => {
                                return (
                                    <Grid item xs={12} key={index}>
                                        <RecentRoll
                                            user={recentRoll.user}
                                            amount={recentRoll.amount}
                                            result={recentRoll.result}
                                            network={network as SolanaNetwork}
                                            deposit_txn={recentRoll.deposit_txn}
                                        />
                                    </Grid>
                                )
                            })}
                        </Grid>
                    </Box>
                </Grid>
            </Grid>
        </div>
    )
}

export default Home;