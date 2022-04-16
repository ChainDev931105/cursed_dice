import {PublicKey, SignatureResult} from "@solana/web3.js";
import {Program} from "@project-serum/anchor";

export enum SolanaNetwork {
    devnet = "devnet",
    mainnet = "mainnet-beta"
}

export interface CreateHouse {
    url: string;
    deposit: number;
    admin: PublicKey;
    executer: PublicKey;
    ratio: number;
    core: PublicKey;
    vault: PublicKey;
    mint: PublicKey;
    program: Program;
    fee: number;
    allowed: number[];
}

export interface TxnResult {
    SignatureResult: SignatureResult,
    Signature: string
}

export interface Bet {
    admin: string;
    bet_state: string;
    executer: string;
    amount: number;
    user: string;
    deposit_txn: string;
    result_txn: string;
    mint: string;
    result: string;
    program_id: string;
}

export interface House {
    program_id: string;
    admin: string;
    executer: string;
    ratio: number;
    fee: number;
    core: string;
    vault: string;
    mints: string[];
    allowed_bets: number[];
}

export interface Error {
    errorMessage: string;
}

export enum BetResult {
    PlayerWon = "PlayerWon",
    HouseWon  = "HouseWon"
}

export interface AccountData {
    publicKey: string;
    mint: string;
    balance: number;
}

export interface Accounts {
    [key: string]: AccountData
}

