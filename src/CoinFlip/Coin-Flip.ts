import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    Transaction,
    TransactionInstruction
} from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';
import {AnchorWallet} from "@solana/wallet-adapter-react";
import {getAssociatedTokenAddress, NATIVE_MINT, TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {CreateHouse, TxnResult} from "../Types/Types";
import {getAllowed, getCoreState, getVaultAuth, getVaultTokenAccount} from "./coin-flip_pda";

export async function getTokenAccount(admin: PublicKey, tokenMint: PublicKey, program: PublicKey): Promise<PublicKey> {
    const [vaultAuthority] = await getVaultAuth(program, admin);
    let vaultTokenAccount;
    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
        vaultTokenAccount = vaultAuthority;
    } else {
        let [_vaultTokenAccount] = await getVaultTokenAccount(program, tokenMint, admin);
        vaultTokenAccount = _vaultTokenAccount;
    }
    return vaultTokenAccount;
}

export async function loadProgram(programId: PublicKey, connection: Connection, wallet: AnchorWallet): Promise<anchor.Program> {
    const provider = new anchor.Provider(connection, wallet,
        {
            preflightCommitment: "processed",
            commitment: "processed",
        });
    const idl = await anchor.Program.fetchIdl(programId, provider);
    return new anchor.Program(idl as anchor.Idl, programId, provider);
}

export async function initialize(admin: PublicKey, executer: PublicKey, feePercent: number, winRatio: number, program: anchor.Program): Promise<TransactionInstruction> {
    const [coreState, coreStateNonce] = await getCoreState(program.programId, admin);
    const [vaultAuthority, vaultAuthNonce] = await getVaultAuth(program.programId, admin);
    return program.instruction.initialize({
        coreStateNonce,
        vaultAuthNonce,
        feePercent: new anchor.BN(feePercent * 100),
        winRatio: new anchor.BN(winRatio * 100)
    }, {
        accounts: {
            admin: admin,
            executer: executer,
            coreState,
            vaultAuthority,
            systemProgram: SystemProgram.programId
        },
    });
}

export async function register(admin: PublicKey, tokenMint: PublicKey, program: anchor.Program, amounts: number[]): Promise<TransactionInstruction> {
    const [coreState] = await getCoreState(program.programId, admin);
    const [vaultAuthority] = await getVaultAuth(program.programId, admin);
    const [vaultTokenAccount, vaultTokenAccountNonce] = await getVaultTokenAccount(program.programId, tokenMint, admin);
    const [allowed] = await getAllowed(program.programId, tokenMint, admin);
    return program.instruction.register({
        vaultTokenAccountNonce,
        amounts: amounts.map(i => new anchor.BN(i))
    }, {
        accounts: {
            allowedBets: allowed,
            coreState,
            admin: admin,
            tokenMint,
            vaultTokenAccount,
            vaultAuthority,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY
        }
    });
}

export async function deposit(admin: PublicKey, tokenMint: PublicKey, amount: number, program: anchor.Program): Promise<TransactionInstruction> {
    const [coreState] = await getCoreState(program.programId, admin);
    const [vaultAuthority] = await getVaultAuth(program.programId, admin);

    const adminTokenAccount = (tokenMint.toBase58() === NATIVE_MINT.toBase58()) ? admin : (await getAssociatedTokenAddress(tokenMint, admin));
    let vaultTokenAccount;
    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
        vaultTokenAccount = vaultAuthority;
    } else {
        let [_vaultTokenAccount] = await getVaultTokenAccount(program.programId, tokenMint, admin);
        vaultTokenAccount = _vaultTokenAccount;
    }
    return program.instruction.deposit({
        amount: new anchor.BN(amount * LAMPORTS_PER_SOL)
    }, {
        accounts: {
            coreState,
            admin: admin,
            vaultAuthority,
            tokenMint,
            adminTokenAccount,
            vaultTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        }
    });
}

export async function withdraw(admin: PublicKey, tokenMint: PublicKey, amount: number, program: anchor.Program): Promise<TransactionInstruction> {
    const [coreState] = await getCoreState(program.programId, admin);
    const [vaultAuthority] = await getVaultAuth(program.programId, admin);
    const adminTokenAccount = (tokenMint.toBase58() === NATIVE_MINT.toBase58()) ? admin : (await getAssociatedTokenAddress(tokenMint, admin));
    let vaultTokenAccount;
    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
        vaultTokenAccount = vaultAuthority;
    } else {
        let [_vaultTokenAccount] = await getVaultTokenAccount(program.programId, tokenMint, admin);
        vaultTokenAccount = _vaultTokenAccount;
    }
    return program.instruction.withdraw({
        amount: new anchor.BN(amount * LAMPORTS_PER_SOL)
    }, {
        accounts: {
            coreState,
            admin: admin,
            vaultAuthority,
            tokenMint,
            adminTokenAccount,
            vaultTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
        },
    });
}

export async function betDirectly(admin: PublicKey, user: PublicKey, tokenMint: PublicKey, amount: number, betSide: boolean, program: anchor.Program): Promise<TransactionInstruction> {
    const [coreState] = await getCoreState(program.programId, admin);
    const [vaultAuthority] = await getVaultAuth(program.programId, admin);
    const [allowed, allowedNonce] = await getAllowed(program.programId, tokenMint, admin);

    const userTokenAccount = (tokenMint.toBase58() === NATIVE_MINT.toBase58()) ? user : (await getAssociatedTokenAddress(tokenMint, user));
    let vaultTokenAccount;
    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
        vaultTokenAccount = vaultAuthority;
    } else {
        const [_vaultTokenAccount] = await getVaultTokenAccount(program.programId, tokenMint, admin);
        vaultTokenAccount = _vaultTokenAccount;
    }

    return program.instruction.betDirectly({
        amount: new anchor.BN(amount),
        betSide,
        allowedAmountsNonce: allowedNonce
    }, {
        accounts: {
            coreState,
            allowedBets: allowed,
            user: user,
            vaultAuthority,
            tokenMint,
            userTokenAccount,
            vaultTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId
        },
    });
}

export async function betReturn(admin: PublicKey, executer: PublicKey, betState: PublicKey, program: anchor.Program): Promise<TransactionInstruction> {
    const [coreState] = await getCoreState(program.programId, admin);
    const {user, tokenMint } = (await program.account.betState.fetch(betState));
    const [vaultAuthority] = await getVaultAuth(program.programId, admin);

    const userTokenAccount = (tokenMint.toBase58() === NATIVE_MINT.toBase58()) ?
        user : (await getAssociatedTokenAddress(tokenMint, user));
    let vaultTokenAccount;
    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
        vaultTokenAccount = vaultAuthority;
    } else {
        let [_vaultTokenAccount] = await getVaultTokenAccount(program.programId, tokenMint, admin);
        vaultTokenAccount = _vaultTokenAccount;
    }

    return program.instruction.betReturn({
        accounts: {
            admin: admin,
            executer: executer,
            coreState,
            user,
            vaultAuthority,
            tokenMint,
            userTokenAccount,
            vaultTokenAccount,
            betState,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
        },
    });
}

export async function bet(admin: PublicKey, user: PublicKey, tokenMint: PublicKey, amount: number, betSide: boolean, program: anchor.Program, flipCounter: number, betState: PublicKey, betStateNonce: number): Promise<TransactionInstruction> {
    let [coreState] = await getCoreState(program.programId, admin);
    let [vaultAuthority] = await getVaultAuth(program.programId, admin);

    const userTokenAccount = (tokenMint.toBase58() === NATIVE_MINT.toBase58()) ? user : (await getAssociatedTokenAddress(tokenMint, user));
    let vaultTokenAccount;
    if (tokenMint.toBase58() === NATIVE_MINT.toBase58()) {
        vaultTokenAccount = vaultAuthority;
    } else {
        let [_vaultTokenAccount] = await getVaultTokenAccount(program.programId, tokenMint, admin);
        vaultTokenAccount = _vaultTokenAccount;
    }
    const [allowed, allowedNonce] = await getAllowed(program.programId, tokenMint, admin);

    return program.instruction.bet({
        amount: new anchor.BN(amount),
        betSide,
        flipCounter: new anchor.BN(flipCounter),
        betStateNonce,
        allowedNonce
    }, {
        accounts: {
            coreState,
            user: user,
            allowedBets: allowed,
            vaultAuthority,
            tokenMint,
            userTokenAccount,
            vaultTokenAccount,
            betState,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: SYSVAR_RENT_PUBKEY
        }
    });
}

export async function processTransaction(instructions: TransactionInstruction[],
                                         connection: Connection,
                                         user: PublicKey,
                                         signTransaction:  ((transaction: anchor.web3.Transaction) => Promise<anchor.web3.Transaction>)): Promise<TxnResult> {
    const tx = new Transaction();
    instructions.map(i => tx.add(i));
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.feePayer = user;
    const signedTx = await signTransaction(tx);
    const sig = await connection.sendRawTransaction(signedTx.serialize(), {
        maxRetries: 3,
        preflightCommitment: "confirmed",
        skipPreflight: false
    });
    const result = await connection.confirmTransaction(sig, 'confirmed');
    console.log(`sig => ${sig} => result ${JSON.stringify(result, null, 2)}`)
    return {
        Signature: sig,
        SignatureResult: result.value
    }
}

export async function createHouse(props: CreateHouse): Promise<TransactionInstruction[]> {
    const instructions = [];
    instructions.push(
        await initialize(props.admin, props.executer, props.fee, props.ratio, props.program),
        await register(props.admin, props.mint, props.program, props.allowed),
        await deposit(props.admin, props.mint,  props.deposit, props.program)
    );
    return instructions;
}


export async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
