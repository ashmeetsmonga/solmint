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

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const MintPage = () => {
  const [walletPrivateKey, setWalletPrivateKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [tokenKey, setTokenKey] = useState("");
  const [recipeintKey, setRecipientKey] = useState("");
  const [amount, setAmount] = useState(100);
  const [isChecked, setIsChecked] = useState(false);

  const router = useRouter();

  const fetchBalance = async () => {
    if (!walletPrivateKey || walletPrivateKey === "") return;
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
    if (!walletPrivateKey || walletPrivateKey === "") return;
    const toastId = toast.loading("Airdropping 5 SOL");
    try {
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      const airdropSignature = await connection.requestAirdrop(payer.publicKey, 5e9);
      const data = await connection.confirmTransaction(airdropSignature);
      toast.success("Airdrop successful", { id: toastId });
      fetchBalance();
    } catch (e) {
      toast.error("Something went wrong", { id: toastId });
    }
  };

  const handleMint = async () => {
    console.log(!tokenKey);
    if (!walletPrivateKey || !tokenKey || !amount || !recipeintKey) return;
    const toastId = toast.loading("Minting Token");
    try {
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      const tokenPublicKey = new PublicKey(tokenKey);
      console.log("Ashmeet token key", tokenPublicKey.toBase58());
      const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, payer, tokenPublicKey, payer.publicKey, false, undefined, undefined, TOKEN_2022_PROGRAM_ID);
      const data = await mintTo(connection, payer, tokenPublicKey, tokenAccount.address, payer, amount * LAMPORTS_PER_SOL, undefined, undefined, TOKEN_2022_PROGRAM_ID);
      toast.success("Token minted successfully, check your wallet", { id: toastId });
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  useEffect(() => {
    if (isChecked) setRecipientKey(walletPrivateKey);
  }, [isChecked]);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">Wallet Private Key</p>
          <Input
            value={walletPrivateKey}
            onChange={(e) => {
              setWalletPrivateKey(e.target.value);
            }}
          />
          <div className="mt-2 flex gap-2 items-center">
            <p className="text-sm text-gray-500">Balance: {balance / LAMPORTS_PER_SOL} SOL</p>
            <RefreshCcw onClick={fetchBalance} size={15} className="text-gray-500 cursor-pointer" />
            <CircleDollarSign onClick={handleAirdrop} size={17} className="text-gray-500 cursor-pointer" />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Token Key</p>
          <Input value={tokenKey} onChange={(e) => setTokenKey(e.target.value)} />
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Amount</p>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.valueAsNumber)} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Recipient Address</p>
          </div>
          <Input value={recipeintKey} onChange={(e) => setRecipientKey(e.target.value)} />
          <div className="flex gap-2 items-center w-full justify-end mt-2">
            <Checkbox checked={isChecked} onCheckedChange={() => setIsChecked((prev) => !prev)} id="terms" />
            <label htmlFor="terms" className="text-sm text-gray-500">
              Same as Wallet
            </label>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Button className="w-full" onClick={handleMint}>
          Mint Token
        </Button>
      </div>
    </div>
  );
};

export default MintPage;
