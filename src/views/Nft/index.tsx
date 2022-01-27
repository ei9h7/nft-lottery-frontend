import { Card, Grid } from "@material-ui/core";
import { BigNumber } from "ethers";
import { useSelector } from "react-redux";
import { IReduxState } from "src/store/slices/state.interface";
import "./nft.scss";

function Nft() {
    const drawLotteryTicket = useSelector<IReduxState, BigNumber[]>(state => state.account.drawLotteryTickets);
    const winnerTickets = useSelector<IReduxState, any[]>(state => state.account.winner_tickets);

    const lotteryTicketsComponent = drawLotteryTicket.map(lotteryTicket => (
        <Grid item lg={3}>
            <Card className="card-lottery-ticket " key={lotteryTicket.toString()}>
                <div className="ticket-content">{lotteryTicket.toString()}</div>
            </Card>
        </Grid>
    ));
    let winnerTicketsComponent;

    if (winnerTickets[0]) {
        winnerTicketsComponent = winnerTickets.map(winnerTicket => (
            <Grid key={winnerTicket.id.toString()} item lg={6}>
                <img className="winner-ticket" src={winnerTicket.url}></img>
            </Grid>
        ));
    }

    return (
        <Grid className="nft-page" container>
            <Grid container>
                <Grid xs={12} item>
                    <h1 className="title">iExec Lottery</h1>
                </Grid>
            </Grid>

            <Grid container justifyContent="center">
                <Card className="card-nft">
                    <div className="nft-card-title">My Tickets</div>
                    <Grid spacing={2} container>
                        {lotteryTicketsComponent}
                    </Grid>
                    <div className="nft-card-title">My winning tickets</div>
                    <Grid spacing={2} container>
                        {winnerTicketsComponent}
                    </Grid>
                </Card>
            </Grid>
        </Grid>
    );
}

export default Nft;
