"use client";
import CreateToken from "@/components/CreateToken";
import Metadata from "@/components/Metadata";
import MintToken from "@/components/MintToken";
import { INewToken } from "@/types";
import { EarthLock } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [newTokenDetails, setNewTokenDetails] = useState<INewToken | null>(null);
  const [selected, setSelected] = useState("create");
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="w-full">
      <nav className=" bg-lime-500 flex justify-center text-lime-500 pt-4">
        <div className="w-[90%] md:w-[500px] px-8 py-4 flex justify-between bg-gray-950 rounded-lg">
          <p className="lg:text-xl cursor-pointer font-thin" onClick={() => handleScroll("home")}>
            Home
          </p>
          <p className="lg:text-xl cursor-pointer font-thin" onClick={() => handleScroll("how-to-use")}>
            How To Use
          </p>
          <p className="lg:text-xl cursor-pointer font-thin" onClick={() => handleScroll("create-mint")}>
            Create/Mint
          </p>
        </div>
      </nav>
      <div id="home" className="w-full h-[60vh] bg-lime-500 flex items-center justify-center px-10 xl:px-20">
        <div className="w-3/4 lg:w-5/6 xl:w-3/4 flex flex-col-reverse justify-between items-center lg:flex-row">
          <div>
            <h1 className="text-black text-center lg:text-left font-black text-7xl mt-4 md:text-8xl lg:mt-0">SolaMint</h1>
            <p className="text-black font-thin text-xl mt-1 lg:text-2xl">Unleash Your Digital Assets: Effortlessly Create and Mint Tokens on Solana.</p>
          </div>
          <div>
            <EarthLock color="black" className="h-52 w-52 md:h-72 md:w-72 lg:h-80 lg:w-80" />
          </div>
        </div>
      </div>
      <div className="w-full py-20 px-10 flex justify-center lg:px-20">
        <div className="w-full md:w-3/4 lg:w-5/6 xl:w-3/4">
          <p className="font-thin text-lime-500 text-xl lg:text-2xl">
            In the fast-evolving world of blockchain, the ability to create and manage your own tokens is a game-changer. Whether you’re a developer, entrepreneur, or innovator, our Solana Token
            Creator & Minter makes it easier than ever to bring your ideas to life. Empower your vision with a platform that’s designed to simplify the entire process, from creation to distribution.
          </p>
        </div>
      </div>
      <div id="how-to-use" className="w-full py-20 px-10 pt-0 flex justify-center lg:px-20">
        <div className="w-full md:w-3/4 lg:w-5/6 xl:w-3/4 ">
          <h2 className="text-5xl font-bold text-lime-500">How to Use</h2>
          <p className="text-lg font-thin text-lime-500 mt-6 lg:text-2xl">1. Create a Token</p>
          <p className="text-lg font-thin text-lime-500 mt-2 lg:text-2xl">2. Add Metadata (optional)</p>
          <p className="text-lg font-thin text-lime-500 mt-2 lg:text-2xl">3. Mint newly created token to your wallet</p>
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="w-full px-4 lg:px-0 lg:w-3/4 flex justify-center gap-2 md:gap-4 lg:gap-8 ">
          <div
            className={`rounded-lg lg:rounded-full cursor-pointer flex items-center justify-center text-sm md:text-lg lg:text-xl p-2 lg:py-4 lg:px-8 ${
              selected === "create" ? "bg-lime-500 text-slate-950" : "bg-slate-950 text-lime-500"
            } hover:bg-lime-500 hover:text-slate-950 transition-all ease-in-out duration-150`}
            onClick={() => setSelected("create")}
          >
            Create New Token
          </div>
          <div
            className={`rounded-lg lg:rounded-full cursor-pointer flex items-center justify-center text-sm md:text-lg lg:text-xl p-2 lg:py-4 lg:px-8  ${
              selected === "metadata" ? "bg-lime-500 text-slate-950" : "bg-slate-950 text-lime-500"
            } hover:bg-lime-500 hover:text-slate-950 transition-all ease-in-out duration-150`}
            onClick={() => setSelected("metadata")}
          >
            Add Metadata
          </div>
          <div
            className={`rounded-lg lg:rounded-full cursor-pointer flex items-center justify-center text-sm md:text-lg lg:text-xl p-2 lg:py-4 lg:px-8  ${
              selected === "mint" ? "bg-lime-500 text-slate-950" : "bg-slate-950 text-lime-500"
            } hover:bg-lime-500 hover:text-slate-950 transition-all ease-in-out duration-150`}
            onClick={() => setSelected("mint")}
          >
            Mint Tokens
          </div>
        </div>
      </div>
      <div id="create-mint" className="w-full flex justify-center px-5 py-10 lg:px-20">
        <div className="rounded-2xl bg-lime-500 w-full md:w-[500px] p-5 md:p-10 relative mt-6">
          <div className="absolute text-xs font-thin text-lime-500 -top-9 right-0">
            <p>* Devnet only (for now)</p>
            <p>* Phantom wallet required (for now)</p>
          </div>
          <h2 className="w-full text-center text-6xl md:text-7xl mb-4 font-black text-black">SolaMint</h2>
          {selected === "create" && <CreateToken newTokenDetails={newTokenDetails} setNewTokenDetails={setNewTokenDetails} isLoading={isLoading} setIsLoading={setIsLoading} />}
          {selected === "metadata" && <Metadata newTokenDetails={newTokenDetails} isLoading={isLoading} setIsLoading={setIsLoading} />}
          {selected === "mint" && <MintToken newTokenDetails={newTokenDetails} isLoading={isLoading} setIsLoading={setIsLoading} />}
        </div>
      </div>
    </div>
  );
}
