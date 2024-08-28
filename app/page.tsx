import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center gap-4">
      <Link className="w-1/2" href="/create">
        <Button className="w-full">Create Token</Button>
      </Link>
      <Link className="w-1/2" href="/mint">
        <Button className="w-full">Mint Token</Button>
      </Link>
    </div>
  );
}
