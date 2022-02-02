import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { BigNumber, ethers } from "ethers";
import { NFTLotteryTicketContract, LotteryContract, NFTWinnerTicketContract } from "../../abi";
import { getAddresses, Networks } from "src/constants";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { setAll, sleep } from "src/helpers";
import { getGasPrice } from "src/helpers/get-gas-price";
import { clearPendingTxn, fetchPendingTxns } from "./pending-txns-slice";
import { info, success } from "./messages-slice";
import { messages } from "src/constants/messages";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";
import { loadAppDetails } from "./app-slice";
export interface IAccount {
    loading: boolean;
    allLotteryTickets: BigNumber[];
    drawLotteryTickets: BigNumber[];
    winner_tickets: IWinnerTicket[];
    win_percentage: number;
    isClaimable: boolean;
    amountDueToUser: number;
    balances: {
        lotteryTicket: number;
        winnerTicket: number;
    };
}
const initialState: IAccount = {
    loading: true,
    allLotteryTickets: [],
    drawLotteryTickets: [],
    winner_tickets: [],
    win_percentage: 0,
    balances: {
        lotteryTicket: 0,
        winnerTicket: 0,
    },
    amountDueToUser: 0,
    isClaimable: false,
};

export interface IGetAccounts {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}
export interface ILotteryTicket {
    ticketNumber: BigNumber;
}
export interface IWinnerTicket {
    ticketNumber: BigNumber;
    imageUri: string;
}

export const getAccount = createAsyncThunk("account/getAccount", async ({ address, networkID, provider }: IGetAccounts): Promise<IAccount> => {
    const addresses = getAddresses(networkID);

    const ticketNFTContract = new ethers.Contract(addresses.NFT_LOTTERY_TICKET_ADDRESS, NFTLotteryTicketContract, provider);
    const lotteryContract = new ethers.Contract(addresses.LOTTERY_ADDRESS, LotteryContract, provider);

    const allLotteryTickets: BigNumber[] = await ticketNFTContract.getTokens(address);
    const lastTicketId: BigNumber = await lotteryContract.lastTicketId();
    const actualTicketId: BigNumber = await ticketNFTContract.getActualId();

    const lotteryTicketForTheDraw = allLotteryTickets.filter(token => parseInt(token.toString()) >= parseInt(lastTicketId.toString()));
    const isRewardClaimable = await lotteryContract.isRewardClaimable(address);
    const amountDueToUser = await lotteryContract.amountDueTo(address);

    const winnerNFTContract = new ethers.Contract(addresses.NFT_WINNER_TICKET_ADDRESS, NFTWinnerTicketContract, provider);
    const numberOfWinnerTicketOwned = await winnerNFTContract.balanceOf(address);

    const winnerTickets: IWinnerTicket[] = await winnerNFTContract.getTokens(address);
    return {
        loading: false,
        allLotteryTickets: allLotteryTickets,
        drawLotteryTickets: lotteryTicketForTheDraw,
        winner_tickets: winnerTickets,
        isClaimable: isRewardClaimable,
        win_percentage: lotteryTicketForTheDraw.length === 0 ? 0 : (lotteryTicketForTheDraw.length / (actualTicketId.toNumber() - lastTicketId.toNumber())) * 100,
        amountDueToUser: amountDueToUser,
        balances: {
            lotteryTicket: lotteryTicketForTheDraw.length,
            winnerTicket: numberOfWinnerTicketOwned,
        },
    };
});

interface IInputTransaction {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}
export const mintLotteryTicket = createAsyncThunk("account/mintLotteryTicket", async ({ address, networkID, provider }: IInputTransaction, { dispatch }) => {
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const lotteryContract = new ethers.Contract(addresses.LOTTERY_ADDRESS, LotteryContract, signer);
    let mintTransaction;
    try {
        const gasPrice = await getGasPrice(provider);
        let txPrice = gasPrice.add(BigNumber.from("10000000000000000"));
        mintTransaction = await lotteryContract.buyTicket({ value: txPrice });
        dispatch(
            fetchPendingTxns({
                txnHash: mintTransaction.hash,
                text: "Minting a Lottery ticket",
                type: "mint_lottery_ticket",
            }),
        );
        await mintTransaction.wait();
        dispatch(success({ text: messages.transaction_sent }));
        dispatch(info({ text: messages.ticket_is_coming }));
        await sleep(5);
        await dispatch(getAccount({ address, networkID, provider }));
        await dispatch(loadAppDetails({ networkID, provider }));
        dispatch(info({ text: messages.ticket_arrived }));
        return;
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (mintTransaction) {
            dispatch(clearPendingTxn(mintTransaction.hash));
        }
    }
});

export const claimRewards = createAsyncThunk("account/claimRewards", async ({ address, networkID, provider }: IInputTransaction, { dispatch }) => {
    const addresses = getAddresses(networkID);
    const signer = provider.getSigner();
    const lotteryContract = new ethers.Contract(addresses.LOTTERY_ADDRESS, LotteryContract, signer);
    let claimRewardsTransaction;
    try {
        const gasPrice = await getGasPrice(provider);

        claimRewardsTransaction = await lotteryContract.claim({ value: gasPrice });
        dispatch(
            fetchPendingTxns({
                txnHash: claimRewardsTransaction.hash,
                text: "Claiming rewards",
                type: "claiming_rewards",
            }),
        );
        await claimRewardsTransaction.wait();
        dispatch(success({ text: messages.transaction_sent }));
        dispatch(info({ text: messages.claiming_rewards }));
        await sleep(5);
        await dispatch(getAccount({ address, networkID, provider }));
        await dispatch(loadAppDetails({ networkID, provider }));
        dispatch(info({ text: messages.claiming_arrived }));
        return;
    } catch (err: any) {
        return metamaskErrorWrap(err, dispatch);
    } finally {
        if (claimRewardsTransaction) {
            dispatch(clearPendingTxn(claimRewardsTransaction.hash));
        }
    }
});

const accountSlice = createSlice({
    name: "account",
    initialState,
    reducers: {
        fetchAccountSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(getAccount.pending, state => {
                state.loading = true;
            })
            .addCase(getAccount.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(getAccount.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

export default accountSlice.reducer;

const baseInfo = (state: RootState) => state.account;

export const getAccountState = createSelector(baseInfo, account => account);
export const { fetchAccountSuccess } = accountSlice.actions;
