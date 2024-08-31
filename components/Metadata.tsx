"use client";

import React, { useState } from "react";
import bs58 from "bs58";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { INewToken } from "@/types";
import toast from "react-hot-toast";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { createSignerFromKeypair, none, PublicKey as MPublicKey, percentAmount, publicKey, signerIdentity } from "@metaplex-foundation/umi";
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import { createV1, Collection, Creator, Uses, CreateV1InstructionAccounts, CreateV1InstructionData, TokenStandard, CollectionDetails, PrintSupply } from "@metaplex-foundation/mpl-token-metadata";
import { Keypair, PublicKey } from "@solana/web3.js";
import CompactToolTip from "./ui/CompactToolTip";

const SPL_TOKEN_2022_PROGRAM_ID = publicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb");

const Metadata = ({ newTokenDetails, isLoading, setIsLoading }: { newTokenDetails: INewToken | null; isLoading: boolean; setIsLoading: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [desc, setDesc] = useState("");
  const [jsonUri, setJsonUri] = useState("");

  const handleMetadata = async () => {
    const toastId = toast.loading("Adding Metadata");
    setIsLoading(true);
    try {
      const umi = createUmi("https://api.devnet.solana.com");
      const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(Keypair.fromSecretKey(bs58.decode(newTokenDetails!.mintWallet))));
      umi.use(signerIdentity(signer, true));

      const ourMetadata = {
        name: name,
        symbol: symbol,
        uri: jsonUri,
        description: desc,
      };

      const onChainData = {
        ...ourMetadata,
        sellerFeeBasisPoints: percentAmount(0, 2),
        creators: none<Creator[]>(),
        collection: none<Collection>(),
        uses: none<Uses>(),
      };

      const accounts: CreateV1InstructionAccounts = {
        mint: fromWeb3JsPublicKey(new PublicKey(newTokenDetails?.tokenMint as string)),
        splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID,
      };

      const data: CreateV1InstructionData = {
        ...onChainData,
        isMutable: true,
        discriminator: 0,
        tokenStandard: TokenStandard.Fungible,
        collectionDetails: none<CollectionDetails>(),
        ruleSet: none<MPublicKey>(),
        createV1Discriminator: 0,
        primarySaleHappened: true,
        decimals: none<number>(),
        printSupply: none<PrintSupply>(),
      };

      const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
      console.log(bs58.encode(txid.signature));
      toast.success("Metadata added successfully", { id: toastId });
    } catch (e) {
      console.log(e);
      toast.error("Something went wrong, please check console logs", { id: toastId });
    }
    setIsLoading(false);
  };

  return (
    <div className="w-full h-[500px] flex flex-col justify-between">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-950 mb-1">Token Name *</p>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="text-lime-300" />
        </div>
        <div>
          <p className="text-sm text-gray-950 mb-1">Token Symbol *</p>
          <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="text-lime-300" placeholder="Example: SOL" />
        </div>
        <div>
          <p className="text-sm text-gray-950 mb-1">Token Description *</p>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} className="text-lime-300" />
        </div>
        <div>
          <p className="text-sm text-gray-950 mb-1">JSON URI</p>
          <Input value={jsonUri} onChange={(e) => setJsonUri(e.target.value)} className="text-lime-300" placeholder="Ex: www.example.com/dummy_name.json" />

          <CompactToolTip
            component={<p className=" w-fit text-xs underline text-black mt-0.5 cursor-pointer">Format</p>}
            title={`The uploaded json must have the following keys: name, symbol, description, image. Image key will hold the value of the hosted image url`}
          />
        </div>
      </div>
      <div className="w-full">
        {newTokenDetails ? (
          <Button disabled={isLoading} className="w-full bg-gray-950 text-lime-300 hover:bg-gray-950 hover:text-lime-300 hover:outline" onClick={handleMetadata}>
            Add Metadata
          </Button>
        ) : (
          <Button disabled className="w-full bg-gray-950 text-lime-300 hover:bg-gray-950 hover:text-lime-300 hover:outline">
            Create new token first
          </Button>
        )}
      </div>
    </div>
  );
};

export default Metadata;
