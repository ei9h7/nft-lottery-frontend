const switchRequest = () => {
    return window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x5" }],
    });
};

const addChainRequest = () => {
    return window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
            {
                chainId: "0x5",
                chainName: "Goerli Testnet",
                nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18,
                },
                rpcUrls: ["https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"],
                blockExplorerUrls: ["https://goerli.etherscan.io"],
            },
            {
                chainId: "0x85",
                chainName: "iExec Test Sidechain",
                nativeCurrency: {
                    name: "xRLC",
                    symbol: "xRLC",
                    decimals: 18,
                },
                rpcUrls: ["https://viviani.iex.ec"],
                blockExplorerUrls: ["https://blockscout-viviani.iex.ec"],
            },
        ],
    });
};

export const swithNetwork = async () => {
    if (window.ethereum) {
        try {
            await switchRequest();
        } catch (error: any) {
            if (error.code === 4902) {
                try {
                    await addChainRequest();
                    await switchRequest();
                } catch (addError) {
                    console.log(error);
                }
            }
            console.log(error);
        }
    }
};
