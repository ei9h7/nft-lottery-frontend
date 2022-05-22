import { Button, Card, Grid, Link } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { getAddresses } from "src/constants";
import { shortenEnd, shortenMiddle, shortenPercentage } from "src/helpers";
import { useWeb3Context } from "src/hooks";
import { mintLotteryTicket } from "src/store/slices/account-slice";
import { startLottery } from "src/store/slices/app-slice";
import { IPendingTxn, isPendingTxn } from "src/store/slices/pending-txns-slice";
import { IReduxState } from "src/store/slices/state.interface";

import "./home.scss";
function Home() {
    const dispatch = useDispatch();
    const { provider, address, chainID, checkWrongNetwork } = useWeb3Context();

    const pendingTransactions = useSelector<IReduxState, IPendingTxn[]>(state => {
        return state.pendingTransactions;
    });
    const ticketNFTBalance = useSelector<IReduxState, number>(state => state.account.balances.lotteryTicket);
    const winPercentage = useSelector<IReduxState, number>(state => state.account.win_percentage);

    const ETHlotteryBalance = useSelector<IReduxState, string>(state => state.app.drawBalanceInETH);
    const USDlotteryBalance = useSelector<IReduxState, number>(state => state.app.drawBalanceInUSD);

    const numberOfTicketInTheDraw = useSelector<IReduxState, number>(state => state.app.numberOfOwnerForTheDraw);

    async function onMintNFT() {
        if (await checkWrongNetwork()) return;
        dispatch(mintLotteryTicket({ provider: provider, networkID: chainID, address: address }));
    }

    async function onStartLottery() {
        if (await checkWrongNetwork()) return;
        dispatch(startLottery({ provider: provider, networkID: chainID, address: address }));
    }

    let startLotteryButton;
    if (address === getAddresses(chainID).DEPLOYER_ADDRESS) {
        startLotteryButton = (
            <Grid item>
                <Button
                    onClick={async () => {
                        if (isPendingTxn(pendingTransactions, "_mint_lottery_ticket")) return;
                        await onStartLottery();
                    }}
                    className="action-button"
                    variant="contained"
                >
                    Start Lottery
                </Button>
            </Grid>
        );
    }

    return (
        <Grid className="home-page" container>
            <Grid container>
                <Grid xs={12} item>
                    <h1 className="title">NFT Lottery</h1>
                </Grid>
            </Grid>

            <Grid container justifyContent="center">
                <Card className="card-home">
                    <Grid spacing={2} container>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <p className="home-card-title">Number of Ticket owned</p>
                            <p className="home-card-title">{ticketNFTBalance.toString()}</p>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <p className="home-card-title">Total ticket bought for this Draw</p>
                            <p className="home-card-value">{numberOfTicketInTheDraw.toString()}</p>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <p className="home-card-title">Total ETH deposit</p>
                            <p className="home-card-value">{shortenEnd(ETHlotteryBalance.toString())}</p>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <p className="home-card-title">Last winner</p>
                            {address && <div className="wallet-link"></div>}{" "}
                            <Link href={`https://goerli.etherscan.io/address/${address}`} target="_blank">
                                <p className="home-card-value">{shortenMiddle(address)}</p>
                            </Link>
                        </Grid>
                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <p className="home-card-title">Total USD deposit</p>
                            <p className="home-card-value">{shortenEnd(USDlotteryBalance.toString())}</p>
                        </Grid>

                        <Grid item lg={6} md={6} sm={6} xs={12}>
                            <p className="home-card-title">Win rate </p>
                            <p className="home-card-value">{shortenPercentage(winPercentage.toString()) + "%"}</p>
                        </Grid>
                        <Grid item lg={12}>
                            <Grid container justifyContent="space-evenly">
                                <Grid item>
                                    <Button
                                        onClick={async () => {
                                            if (isPendingTxn(pendingTransactions, "_mint_lottery_ticket")) return;
                                            await onMintNFT();
                                        }}
                                        className="action-button"
                                        variant="contained"
                                    >
                                        Mint a Ticket
                                    </Button>
                                </Grid>

                                {startLotteryButton}
                            </Grid>
                        </Grid>
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    );
}

export default Home;
