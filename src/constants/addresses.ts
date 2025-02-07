import { Networks } from "./blockchain";

const VIVIANI_TESTNET_SIDECHAIN = {
    DEPLOYER_ADDRESS: "0xe58832f4D3e1287c81d87160F0C61a35008B8276",
    NFT_LOTTERY_TICKET_ADDRESS: "",
    NFT_WINNER_TICKET_ADDRESS: "",
    LOTTERY_ADDRESS: "",
};

const GOERLI_TESTNET = {
    DEPLOYER_ADDRESS: "0xe58832f4D3e1287c81d87160F0C61a35008B8276",
    NFT_LOTTERY_TICKET_ADDRESS: "0xF4e8871F4B0a4ADcEF990Ef7Dac49CBB9545350D",
    NFT_WINNER_TICKET_ADDRESS: "0xe0a4613699c5396c9b645345054E52Cd5226DAe2",
    LOTTERY_ADDRESS: "0x639940eDaE3B2bC61973a283bbCdC10d03ad946D",
};

export const getAddresses = (networkID: number) => {
    if (networkID === Networks.VIVIANI) return VIVIANI_TESTNET_SIDECHAIN;
    if (networkID === Networks.GOERLI) return GOERLI_TESTNET;
    throw Error("Network don't support");
};
