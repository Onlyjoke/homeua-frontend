import {useEffect, useState} from 'react';
import axios from 'axios';
import CounterInput from "react-counter-input";
import { useMoralisWeb3Api, useMoralis } from "react-moralis";

import './App.css';
import contract from './contracts/HomeUaTestNFT4.json';
import {ethers} from 'ethers';
import gifHomeUa from './images/homeua.gif'

const contractAddress = "0xB2d494DCbEC3Aa221Fcf11E51B5718EE52484977";
const abi = contract.abi;
const price = 0.05;

function App() {
    const isMobile = window.innerWidth <= 768;
    const [currentAccount, setCurrentAccount] = useState(null);
    const [isMinting, setMinting] = useState(false);
    const [nftContract, setNftContract] = useState(null);
    const [mintedNFT, setMintedNFT] = useState(null);
    const [error, setTxError] = useState(null);
    const [mintCounter, changeMintCounter] = useState(1);

    const Web3Api = useMoralisWeb3Api();
    const { authenticate, isAuthenticated } = useMoralis();

    useEffect(() => {
        checkWalletIsConnected();
    }, [currentAccount])

    const checkWalletIsConnected = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            console.log("Make sure you have Metamask installed!");
            return;
        } else {
            console.log("Wallet exists! We're ready to go!")
        }

        const accounts = await ethereum.request({method: 'eth_accounts'});

        if (accounts.length !== 0) {
            const account = accounts[0];
            console.log("Found an authorized account: ", account);
            setCurrentAccount(account);
        } else {
            console.log("No authorized account found");
        }
    }

    const connectWalletHandler = async () => {
        const { ethereum } = window;

        if (!ethereum) {
            alert("Please install Metamask!");
        }

        try {
            if (!isAuthenticated) {
                let user;

                isMobile ?
                    user = await authenticate({ provider: "walletconnect" })
                    :
                    user = await authenticate()

                setCurrentAccount(user?.get("accounts")[0]);
            }
        } catch (err) {
            console.log(err)
        }
    }

    const mintNftHandler = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const nftContract = new ethers.Contract(contractAddress, abi, signer);

                console.log("Initialize payment");
                let nftTxn = await nftContract.mint(mintCounter, {
                    value: ethers.utils.parseEther((mintCounter * price).toString())
                });
                setMinting(true);
                console.log("Mining... please wait");
                let tx = await nftTxn.wait();
                setMinting(false);
                console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
                setNftContract(nftTxn)
                let event = tx.events[0]
                let value = event.args[2]
                let tokenId = value.toNumber()

                const options = {
                    address: contractAddress,
                    chain: "eth",
                };

                const NFTs = await Web3Api.token.getAllTokenIds(options);
                console.log('NFTs ', NFTs);

                await getMintedNFT(tokenId)

            } else {
                console.log("Ethereum object does not exist");
            }

        } catch (err) {
            console.log(err);
        }
    }

    // Gets the minted NFT data
    const getMintedNFT = async (tokenId) => {
        try {
            const {ethereum} = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const nftContract = new ethers.Contract(
                    contractAddress,
                    abi,
                    signer
                )

                let tokenUri = await nftContract.tokenURI(tokenId);
                console.log('tokenUri ', tokenUri)
                const ipfsToHTTP = tokenUri.replace("ipfs://", "https://ipfs.io/ipfs/");
                let { data } = await axios.get(ipfsToHTTP);

                data.image = data?.image.replace("ipfs://", "https://ipfs.io/ipfs/");
                console.log('data ', data)

                setMintedNFT(data)
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
            setTxError(error.message)
        }
    }

    const connectWalletButton = () => {
        return (
            <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
                Connect Wallet
            </button>
        )
    }

    const mintNftButton = () => {
        return (
            <>
                <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
                    Mint NFT
                </button>
                <div className='mint-nft-counter'>
                    <CounterInput
                        count={mintCounter}
                        min={1}
                        max={5}
                        onCountChange={count => changeMintCounter(count)}
                    />
                </div>
            </>
        )
    }

    return (
        <div className='main-app'>
            <h1>HOMEUA MINT</h1>
            <div className='mt40'>
                {currentAccount ? mintNftButton() : connectWalletButton()}
            </div>
            {
                error &&
                <div>
                    {error.message}
                </div>
            }
            {
                isMinting &&
                <div className='mt40'>
                    <div className='blink_me'>...Minting HOMEUA</div>
                    <div className='mt40'>
                        <img
                            src={gifHomeUa}
                            alt='minting HOMEUA NFT'
                        />
                    </div>
                </div>
            }
            {
                mintedNFT &&
                <div className='mt40'>
                    <div>NAME: {mintedNFT?.name}</div>
                    <div className='mt40'>
                        <a
                            className='minted-img-wrapp'
                            href={`https://testnets.opensea.io/assets/${contractAddress}/${mintedNFT?.edition}`}
                            target='_blank' rel="noreferrer"
                        >
                            <img
                                src={mintedNFT?.image}
                                alt='minted HOMEUA NFT'
                            />
                        </a>
                    </div>
                    <div className='mt40'>
                        <div>DESCRIPTION: {mintedNFT?.description}</div>
                    </div>
                </div>
            }
            {
                nftContract?.from &&
                <div className='mt40'>
                    <div>HOMEUA minting successful!!!!</div>
                    <a target='_blank' rel="noreferrer"   href={`https://testnets.opensea.io/${nftContract.from}`}>Click here</a>
                    <span> to view your NFT on OpenSea.</span>
                </div>
            }
            {
                nftContract?.hash &&
                <div className='mt40'>
                    <a target='_blank' rel="noreferrer"   href={`https://rinkeby.etherscan.io/tx/${nftContract?.hash}`}>Your transaction</a>
                </div>
            }
            <div className='mt40'>
                <div>SMART CONTRACT ADDRESS:</div>
                <a target='_blank' rel="noreferrer"   href={`https://rinkeby.etherscan.io/address/${contractAddress}`}>{contractAddress}</a>
            </div>
        </div>
    )
}

export default App;
