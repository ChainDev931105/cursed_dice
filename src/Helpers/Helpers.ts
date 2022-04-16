import {SolanaNetwork} from "../Types/Types";

export async function fetchDataUtil(url: string): Promise<null|any> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.log(`fetchData ${url} => error => status => ${response.status}`);
        } else {
            return response.json();
        }
    } catch (e) {
        console.log(`fetchData ${url} => error => ${e}`);
    }
    return null;
}

export async function postDataUtil(url: string, data: object): Promise<null|any> {
    try {
        return await fetch(url, {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(data),
        }).then((response) => response.json());
    } catch (e: any) {
        console.log(`postDataUtil => e => ${e.message}`);
        return null;
    }
}

export function getTxnExplorerLink(txn: string, network: SolanaNetwork) {
    return `https://explorer.solana.com/tx/${txn}?cluster=${network}`;
}

export function getWalletExplorerLink(wallet: string, network: SolanaNetwork) {
    return `https://explorer.solana.com/address/${wallet}?cluster=${network}`;
}