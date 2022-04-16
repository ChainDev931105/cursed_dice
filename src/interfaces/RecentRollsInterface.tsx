import {SolanaNetwork} from "../Types/Types";

export interface RecentRollsInterface {
    user: string;
    result: string;
    amount: number;
    network: SolanaNetwork;
    deposit_txn: string;
}