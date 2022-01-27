import { getTokenPrice, setAll, sleep } from "../../helpers";
import { createSlice, createSelector, createAsyncThunk } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { RootState } from "../store";
import { getAddresses, Networks } from "src/constants";
import { BigNumber, ethers } from "ethers";
import { LotteryContract, NFTLotteryTicketContract } from "src/abi";
import { clearPendingTxn, fetchPendingTxns } from "./pending-txns-slice";
import { info, success } from "./messages-slice";
import { getAccount } from "./account-slice";
import { messages } from "src/constants/messages";
import { metamaskErrorWrap } from "src/helpers/metamask-error-wrap";

interface ILoadAppDetails {
    networkID: number;
    provider: JsonRpcProvider;
}

export const loadAppDetails = createAsyncThunk(
    "app/loadAppDetails",

    async ({ networkID, provider }: ILoadAppDetails): Promise<IDApp> => {
        const addresses = getAddresses(networkID);

        const lotteryContract = new ethers.Contract(addresses.LOTTERY_ADDRESS, LotteryContract, provider);

        const NFTLorreryTicketContract = new ethers.Contract(addresses.NFT_LOTTERY_TICKET_ADDRESS, NFTLotteryTicketContract, provider);
        const drawBalance: BigNumber = await lotteryContract.drawBalance();
        const lastTicketId = await lotteryContract.lastTicketId();
        const actualTicketId = await NFTLorreryTicketContract.getActualId();

        return {
            loading: false,
            numberOfOwnerForTheDraw: actualTicketId - lastTicketId,
            drawBalanceInUSD: parseFloat(ethers.utils.formatEther(drawBalance)) * getTokenPrice("ETH"),
            drawBalanceInETH: ethers.utils.formatEther(drawBalance),
        };
    },
);

interface IStartLottery {
    address: string;
    networkID: Networks;
    provider: StaticJsonRpcProvider | JsonRpcProvider;
}
export const startLottery = createAsyncThunk(
    "app/startLottery",

    async ({ address, networkID, provider }: IStartLottery, { dispatch }) => {
        const addresses = getAddresses(networkID);
        const signer = provider.getSigner();
        const lotteryContract = new ethers.Contract(addresses.LOTTERY_ADDRESS, LotteryContract, signer);
        let startLotteryTransaction;
        try {
            startLotteryTransaction = await lotteryContract.startLottery();

            dispatch(
                fetchPendingTxns({
                    txnHash: startLotteryTransaction.hash,
                    text: "Start Lottery",
                    type: "start_lottery",
                }),
            );
            await startLotteryTransaction.wait();
            dispatch(success({ text: messages.transaction_sent }));
            dispatch(info({ text: messages.ticket_is_coming }));
            await sleep(10);
            await dispatch(getAccount({ address, networkID, provider }));
            dispatch(info({ text: messages.ticket_arrived }));
            return;
        } catch (err: any) {
            return metamaskErrorWrap(err, dispatch);
        } finally {
            if (startLotteryTransaction) {
                dispatch(clearPendingTxn(startLotteryTransaction.hash));
            }
        }
    },
);
const initialState = {
    loading: true,
    drawBalanceInUSD: 0,
    drawBalanceInETH: "0",
};

export interface IDApp {
    loading: boolean;
    drawBalanceInUSD: number;
    drawBalanceInETH: string;
    numberOfOwnerForTheDraw: number;
}

export interface IAppSlice {
    loading: boolean;
    networkID: number;
}

const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        fetchAppSuccess(state, action) {
            setAll(state, action.payload);
        },
    },
    extraReducers: builder => {
        builder
            .addCase(loadAppDetails.pending, (state, action) => {
                state.loading = true;
            })
            .addCase(loadAppDetails.fulfilled, (state, action) => {
                setAll(state, action.payload);
                state.loading = false;
            })
            .addCase(loadAppDetails.rejected, (state, { error }) => {
                state.loading = false;
                console.log(error);
            });
    },
});

const baseInfo = (state: RootState) => state.app;

export default appSlice.reducer;

export const { fetchAppSuccess } = appSlice.actions;

export const getAppState = createSelector(baseInfo, app => app);
