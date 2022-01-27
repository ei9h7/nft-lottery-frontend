import { useCallback, useState } from "react";
import { NavLink } from "react-router-dom";
import { Link } from "@material-ui/core";

import { shortenMiddle } from "../../../helpers";
import { useAddress } from "../../../hooks";

import classnames from "classnames";
import Earth from "../../../assets/earthBrand.png";
import "./drawer-content.scss";
import Dashboard from "../../../assets/icons/dashboard.svg";
import NftIcon from "../../../assets/icons/nftIcons.png";

function NavContent() {
    const [isActive] = useState();
    const address = useAddress();

    const checkPage = useCallback((location: any, page: string): boolean => {
        const currentPath = location.pathname.replace("/", "");
        if (currentPath.indexOf("home") >= 0 && page === "home") {
            return true;
        }

        return false;
    }, []);

    return (
        <div className="dapp-sidebar">
            <div className="branding-header">
                <Link href="#" target="_blank">
                    <img className="branding-logo" alt="" src={Earth} />
                </Link>

                {address && (
                    <div className="wallet-link">
                        <Link href={`https://goerli.etherscan.io/address/${address}`} target="_blank">
                            <p>{shortenMiddle(address)}</p>
                        </Link>
                    </div>
                )}
            </div>

            <div className="dapp-menu-links">
                <div className="dapp-nav">
                    <Link
                        component={NavLink}
                        to="/"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "dashboard");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={Dashboard} />
                            <p>Dashboard</p>
                        </div>
                    </Link>

                    <Link
                        component={NavLink}
                        to="/nfts"
                        isActive={(match: any, location: any) => {
                            return checkPage(location, "dashboard");
                        }}
                        className={classnames("button-dapp-menu", { active: isActive })}
                    >
                        <div className="dapp-menu-item">
                            <img alt="" src={NftIcon} />
                            <p>My NFTs</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NavContent;
