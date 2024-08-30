"use client";
import CreateToken from "@/components/CreateToken/CreateToken";
import MintToken from "@/components/MintToken/MintToken";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INewToken } from "@/types";
import { useState } from "react";

export default function Home() {
  const [newTokenDetails, setNewTokenDetails] = useState<INewToken | null>(null);

  return (
    <div className="w-full h-full">
      <Tabs defaultValue="create" className="w-full h-full flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="create">
            Create
          </TabsTrigger>
          <TabsTrigger className="w-full" value="mint">
            Mint
          </TabsTrigger>
        </TabsList>
        <TabsContent className="flex-grow w-full pt-2" value="create">
          <CreateToken newTokenDetails={newTokenDetails} setNewTokenDetails={setNewTokenDetails} />
        </TabsContent>
        <TabsContent value="mint" className="flex-grow w-full pt-2">
          <MintToken newTokenDetails={newTokenDetails} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
