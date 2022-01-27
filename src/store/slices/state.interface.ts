import { IPendingTxn } from "./pending-txns-slice";
import { IAccount } from "./account-slice";
import { IDApp } from "./app-slice";
import { MessagesState } from "./messages-slice";

export interface IReduxState {
    pendingTransactions: IPendingTxn[];
    account: IAccount;
    app: IDApp;
    messages: MessagesState;
}
