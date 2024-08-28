"use client";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { CircleDollarSign, RefreshCcw } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import CompactToolTip from "@/components/ui/CompactToolTip";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const CreatePage = () => {
  const [walletPrivateKey, setWalletPrivateKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [decimals, setDecimals] = useState(9);
  const [freezeAuthorityPrivateKey, setFreezeAuthorityPrivateKey] = useState("");
  const [isChecked, setIsChecked] = useState(false);

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

  const handleCreate = async () => {
    if (!walletPrivateKey || !decimals || !freezeAuthorityPrivateKey) {
      toast.error("Please fill all required fields");
      return;
    }
    const toastId = toast.loading("Creating Token");
    try {
      const secretKey = bs58.decode(walletPrivateKey);
      const payer = Keypair.fromSecretKey(secretKey);
      const freezeAuthority = freezeAuthorityPrivateKey === "" ? null : Keypair.fromSecretKey(bs58.decode(freezeAuthorityPrivateKey)).publicKey;

      const mint = await createMint(connection, payer, payer.publicKey, freezeAuthority, decimals, undefined, undefined, TOKEN_2022_PROGRAM_ID);
      toast.dismiss(toastId);
      router.push(`/create/${mint.toBase58()}`);
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong", { id: toastId });
    }
  };

  useEffect(() => {
    if (isChecked) setFreezeAuthorityPrivateKey(walletPrivateKey);
  }, [isChecked]);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500 mb-2">Wallet Private Key *</p>
          <Input
            value={walletPrivateKey}
            onChange={(e) => {
              setWalletPrivateKey(e.target.value);
            }}
          />
          <div className="mt-2 flex gap-2 items-center">
            <p className="text-sm text-gray-500">Balance: {balance / LAMPORTS_PER_SOL} SOL</p>
            <CompactToolTip component={<RefreshCcw onClick={fetchBalance} size={15} className="text-gray-500 cursor-pointer" />} title="Refresh" />
            <CompactToolTip component={<CircleDollarSign onClick={handleAirdrop} size={17} className="text-gray-500 cursor-pointer" />} title="Airdrop 5 SOL" />
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Decimals *</p>
          <Input type="number" value={decimals} onChange={(e) => setDecimals(e.target.valueAsNumber)} />
        </div>
        <div>
          <div className="flex justify-between mb-2">
            <p className="text-sm text-gray-500">Freeze Authority Private Key *</p>
          </div>
          <Input value={freezeAuthorityPrivateKey} onChange={(e) => setFreezeAuthorityPrivateKey(e.target.value)} />
          <div className="flex gap-2 items-center w-full justify-end mt-2">
            <Checkbox checked={isChecked} onCheckedChange={() => setIsChecked((prev) => !prev)} id="terms" />
            <label htmlFor="terms" className="text-sm text-gray-500">
              Same as Wallet
            </label>
          </div>
        </div>
      </div>
      <div className="w-full">
        <p className="text-xs text-gray-500 mb-2 font-light">* Token Metadata feature is coming soon</p>
        <Button className="w-full" onClick={handleCreate}>
          Create Token
        </Button>
      </div>
    </div>
  );
};

export default CreatePage;
