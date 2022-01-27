import { Dispatch } from "redux";
import { error } from "../store/slices/messages-slice";
import { messages } from "../constants/messages";

export const metamaskErrorWrap = (err: any, dispatch: Dispatch) => {
    let text = messages.something_wrong;

    if (err.code && (err.code === -32603 || err.code === "UNPREDICTABLE_GAS_LIMIT")) {
        if (err.data && err.data.message) {
            text = err.data.message.includes(":") ? err.data.message.split(":")[1].trim() : err.data.data || err.data.message;
        }
        if (err.error.message && err.error.message.includes("More than two lottery tickets have to be minted")) {
            text = "More than two lottery tickets have to be minted";
        }

        if (err.data && err.data.message && err.data.message.includes("gas required exceeds allowance")) {
            text = "Insufficient balance to make a transaction";
        }
    }

    if (err.code && err.code === 4001) {
        if (err.message.includes("User denied transaction signature")) {
            text = "User denied transaction signature";
        }
    }

    return dispatch(error({ text, error: err }));
};
