"use client";

import { Button } from "@/components/ui/button";
import { Files } from "lucide-react";
import React from "react";
import toast from "react-hot-toast";

const TokenSuccessPage = ({ params }: { params: { mintKey: string } }) => {
  const handleCopy = () => {
    navigator.clipboard
      .writeText(params.mintKey)
      .then(() => toast.success(`Token key copied to clipboard!`))
      .catch(() => toast.error(`Failed to copy token key`));
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex flex-col mt-10 gap-8">
        <p className="font-black text-4xl tracking-tight text-center">Token Created Successfully!!!</p>
        <div className="w-full bg-gray-100 rounded p-4">
          <div className="w-full flex justify-center items-center mb-2 gap-2">
            <p className="font-light text-sm">New Token(Mint) Id</p>
            <Files size={20} className="cursor-pointer" onClick={handleCopy} />
          </div>
          <p className="font-mono font-bold">{params.mintKey}</p>
        </div>
      </div>
      <Button className="w-full">Mint Token</Button>
    </div>
  );
};

export default TokenSuccessPage;
