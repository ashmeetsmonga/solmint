"use client";
import bs58 from "bs58";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Files } from "lucide-react";
import React, { useEffect, useState } from "react";
import { createMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import toast from "react-hot-toast";
import { INewToken } from "@/types";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

declare global {
  interface Window {
    solana: any;
  }
}

const CreateToken = ({
  newTokenDetails,
  setNewTokenDetails,
  isLoading,
  setIsLoading,
}: {
  newTokenDetails: INewToken | null;
  setNewTokenDetails: React.Dispatch<React.SetStateAction<INewToken | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [decimals, setDecimals] = useState(9);
  const [freezeAuthorityPublicKey, setFreezeAuthorityPublicKey] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const handleAirdrop = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      toast.error("No Phantom Wallet found, please install Phantom");
      return;
    }
    const toastId = toast.loading("Airdropping 2 SOL");
    setIsLoading(true);
    try {
      const phantomPublicKey = await connectPhantom();
      const airdropSignature = await connection.requestAirdrop(phantomPublicKey, 2 * LAMPORTS_PER_SOL);
      const data = await connection.confirmTransaction(airdropSignature);
      toast.success("Airdrop successful", { id: toastId });
    } catch (e: any) {
      console.log(e?.error);
      toast.error("Something went wrong", { id: toastId });
    }
    setIsLoading(false);
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

  const handleCreate = async () => {
    if (!decimals) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!window.solana || !window.solana.isPhantom) {
      toast.error("No Phantom Wallet found, please install Phantom");
      return;
    }

    const toastId = toast.loading("Awaiting Transaction...");
    setIsLoading(true);
    try {
      const mintWallet = Keypair.generate();
      const phantomPublicKey = await connectPhantom();
      const freezeAuthority = freezeAuthorityPublicKey === "" ? null : new PublicKey(freezeAuthorityPublicKey);

      const { blockhash } = await connection.getLatestBlockhash("finalized");
      const transaction = new Transaction({
        recentBlockhash: blockhash,
        feePayer: phantomPublicKey,
      }).add(
        SystemProgram.transfer({
          fromPubkey: phantomPublicKey,
          toPubkey: new PublicKey(mintWallet.publicKey),
          lamports: LAMPORTS_PER_SOL * 0.2,
        })
      );

      const { signature } = await window.solana.signAndSendTransaction(transaction);
      const result = await connection.confirmTransaction(signature, "confirmed");

      if (result.value.err) throw new Error("Transaction via Phantom failed");

      toast.loading("Transaction successful, creating Token...", { id: toastId });

      const mint = await createMint(connection, mintWallet, mintWallet.publicKey, freezeAuthority, decimals, undefined, undefined, TOKEN_2022_PROGRAM_ID);
      toast.success("Token created successfully", { id: toastId });

      setNewTokenDetails({
        mintWallet: bs58.encode(mintWallet.secretKey),
        tokenMint: mint.toBase58(),
      });
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong", { id: toastId });
    }
    setIsLoading(false);
  };

  const setPhantomWalletAsFreezeAuthority = async () => {
    if (!window.solana || !window.solana.isPhantom) {
      toast.error("No Phantom Wallet found, please install Phantom");
      return;
    }
    const phantomPublicKey = await connectPhantom();
    setFreezeAuthorityPublicKey(phantomPublicKey);
  };

  useEffect(() => {
    if (isChecked) setPhantomWalletAsFreezeAuthority();
    else setFreezeAuthorityPublicKey("");
  }, [isChecked]);

  return (
    <div className="w-full">
      {newTokenDetails ? (
        <>
          <CreateSuccess newTokenDetails={newTokenDetails} setNewTokenDetails={setNewTokenDetails} />
        </>
      ) : (
        <div className="w-full min-h-[500px] flex flex-col justify-between items-center">
          <div className="flex flex-col gap-4 w-full">
            <div>
              <p className="text-sm text-gray-950 mb-2">Decimals *</p>
              <Input type="number" value={decimals} onChange={(e) => setDecimals(e.target.valueAsNumber)} className="text-lime-500" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm text-gray-950">Freeze Authority Public Key</p>
              </div>
              <Input value={freezeAuthorityPublicKey} onChange={(e) => setFreezeAuthorityPublicKey(e.target.value)} className="text-lime-500" />
              <div className="flex gap-2 items-center w-full justify-end mt-2">
                <Checkbox checked={isChecked} onCheckedChange={() => setIsChecked((prev) => !prev)} />
                <label htmlFor="terms" className="text-sm text-gray-950">
                  Same as Wallet
                </label>
              </div>
            </div>
          </div>
          <div className="w-full mt-4">
            <div className="w-full flex flex-col gap-2 lg:flex-row">
              <Button disabled={isLoading} className="w-full bg-gray-950 text-lime-500 hover:bg-gray-950 hover:text-lime-500" onClick={handleAirdrop}>
                Airdrop 2 SOL In Phantom
              </Button>
              <Button disabled={isLoading} className="w-full bg-gray-950 text-lime-500 hover:bg-gray-950 hover:text-lime-500" onClick={handleCreate}>
                Create Token (0.2 SOL)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CreateSuccess = ({ newTokenDetails, setNewTokenDetails }: { newTokenDetails: INewToken; setNewTokenDetails: React.Dispatch<React.SetStateAction<INewToken | null>> }) => {
  const handleCopy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`Copied to clipboard!`))
      .catch(() => toast.error(`Failed to copy`));
  };

  return (
    <div className="w-full min-h-[500px] flex flex-col">
      <div className="flex-grow flex flex-col mt-4 gap-4">
        <p className="font-black text-4xl tracking-tight text-center mb-4 text-black">Token Created Successfully!!!</p>
        <div className="w-full bg-gray-950 rounded p-4">
          <div className="w-full flex justify-center items-center mb-2 gap-2">
            <p className="font-light text-sm text-lime-500">New Token(Mint) Id</p>
            <Files size={20} className="cursor-pointer text-lime-500" onClick={() => handleCopy(newTokenDetails.tokenMint)} />
          </div>
          <p className="font-mono font-bold text-lime-500 text-ellipsis overflow-clip">{newTokenDetails.tokenMint}</p>
        </div>
        <div className="w-full bg-gray-950 rounded p-4">
          <div className="w-full flex justify-center items-center mb-2 gap-2">
            <p className="font-light text-sm text-lime-500">Mint Wallet Private Key</p>
            <Files size={20} className="cursor-pointer text-lime-500" onClick={() => handleCopy(newTokenDetails.mintWallet)} />
          </div>
          <p className="font-mono font-bold text-ellipsis overflow-clip text-lime-500">{newTokenDetails.mintWallet}</p>
        </div>
      </div>
      <Button onClick={() => setNewTokenDetails(null)} className="w-full bg-gray-950 text-lime-500 hover:bg-gray-950 hover:text-lime-500">
        Create New Token
      </Button>
    </div>
  );
};

export default CreateToken;
