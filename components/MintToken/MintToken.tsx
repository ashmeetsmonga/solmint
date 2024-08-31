"use client";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { CircleDollarSign, RefreshCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getOrCreateAssociatedTokenAccount, mintTo, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CompactToolTip from "@/components/ui/CompactToolTip";
import { INewToken } from "@/types";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const MintToken = ({ newTokenDetails }: { newTokenDetails: INewToken | null }) => {
  const [walletPrivateKey, setWalletPrivateKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [tokenKey, setTokenKey] = useState("");
  const [recipeintPublicKey, setRecipientPublicKey] = useState("");
  const [amount, setAmount] = useState(100);
  const [isUsePhantomChecked, setIsUsePhantomChecked] = useState(false);
  const [isUseNewlyCreatedToken, setIsUseNewlyCreatedToken] = useState(false);

  const router = useRouter();

  const fetchBalance = async () => {
    if (!walletPrivateKey || walletPrivateKey === "") {
      toast.error("Please provide wallet");
      return;
    }
    const toastId = toast.loading("Fetching Balance");
    try {
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      const publicKey = payer.publicKey;
      const balance = await connection.getBalance(publicKey);
      toast.success("Balance fetched successfully", { id: toastId });
      setBalance(balance);
    } catch (error) {
      toast.error("Error in fetching balance", { id: toastId });
    }
  };

  const handleAirdrop = async () => {
    if (!walletPrivateKey || walletPrivateKey === "") {
      toast.error("Please provide wallet");
      return;
    }
    const toastId = toast.loading("Airdropping 2 SOL");
    try {
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2e9);
      const data = await connection.confirmTransaction(airdropSignature);
      toast.success("Airdrop successful", { id: toastId });
      fetchBalance();
    } catch (e) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const handleMint = async () => {
    if (!walletPrivateKey || !tokenKey || !amount || !recipeintPublicKey) {
      toast.error("Please fill all required fields");
      return;
    }
    const toastId = toast.loading("Minting Token");
    try {
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      const tokenPublicKey = new PublicKey(tokenKey);
      const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, tokenPublicKey, new PublicKey(recipeintPublicKey), false, undefined, undefined, TOKEN_2022_PROGRAM_ID);
      const data = await mintTo(connection, payer, tokenPublicKey, tokenAccount.address, payer, amount * LAMPORTS_PER_SOL, undefined, undefined, TOKEN_2022_PROGRAM_ID);
      toast.success("Token minted successfully, check your wallet", { id: toastId });
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect();
        console.log("Connected with Public Key:", response.publicKey.toString());
        return response.publicKey;
      } catch (err) {
        console.error("Connection failed:", err);
      }
    } else {
      console.log("Phantom Wallet not found.");
    }
  }

  const setPhantomWalletAsRecipient = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      toast.error("No Phantom Wallet found, please install Phantom");
      return;
    }
    const phantomPublicKey = await connectPhantom();
    setRecipientPublicKey(phantomPublicKey);
  };

  useEffect(() => {
    if (isUsePhantomChecked) setPhantomWalletAsRecipient();
    else setRecipientPublicKey("");
  }, [isUsePhantomChecked]);

  useEffect(() => {
    if (isUseNewlyCreatedToken && newTokenDetails) {
      setWalletPrivateKey(newTokenDetails.mintWallet);
      setTokenKey(newTokenDetails.tokenMint);
    } else {
      setWalletPrivateKey("");
      setTokenKey("");
    }
  }, [isUseNewlyCreatedToken]);

  useEffect(() => {
    if (newTokenDetails !== null) setIsUseNewlyCreatedToken(true);
  }, [newTokenDetails]);

  return (
    <div className="w-full h-[500px] flex flex-col justify-between">
      <div className="flex flex-col gap-3">
        <div className="flex gap-2 items-center w-full mt-2">
          <Checkbox disabled={newTokenDetails === null} checked={isUseNewlyCreatedToken} onCheckedChange={() => setIsUseNewlyCreatedToken((prev) => !prev)} id="terms" />
          <label htmlFor="terms" className={`text-sm ${newTokenDetails === null ? "text-lime-800" : "text-gray-950"}`}>
            Use newly created token
          </label>
        </div>
        {!isUseNewlyCreatedToken && (
          <>
            <div>
              <p className="text-sm text-gray-950 mb-1">Mint Private Key *</p>
              <Input
                value={walletPrivateKey}
                onChange={(e) => {
                  setWalletPrivateKey(e.target.value);
                }}
                className="text-lime-500"
              />
              <div className="mt-1 flex gap-2 items-center">
                <p className="text-sm text-gray-950">Balance: {balance / LAMPORTS_PER_SOL} SOL</p>
                <CompactToolTip component={<RefreshCcw onClick={fetchBalance} size={15} className="text-gray-950 cursor-pointer" />} title="Refresh" />
                <CompactToolTip component={<CircleDollarSign onClick={handleAirdrop} size={17} className="text-gray-950 cursor-pointer" />} title="Airdrop 2 SOL" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-950 mb-1">Token Key *</p>
              <Input value={tokenKey} onChange={(e) => setTokenKey(e.target.value)} className="text-lime-500" />
            </div>
          </>
        )}
        <div>
          <p className="text-sm text-gray-950 mb-1">Amount</p>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)} className="text-lime-500" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <p className="text-sm text-gray-950">Recipient Address *</p>
          </div>
          <Input value={recipeintPublicKey} onChange={(e) => setRecipientPublicKey(e.target.value)} className="text-lime-500" />
          <div className="flex gap-2 items-center w-full justify-end mt-2">
            <Checkbox checked={isUsePhantomChecked} onCheckedChange={() => setIsUsePhantomChecked((prev) => !prev)} id="terms" />
            <label htmlFor="terms" className="text-sm text-gray-950">
              In Phantom Wallet
            </label>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Button className="w-full bg-gray-950 text-lime-500 hover:bg-gray-950 hover:text-lime-500" onClick={handleMint}>
          Mint Token
        </Button>
      </div>
    </div>
  );
};

export default MintToken;
