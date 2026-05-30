import Link from "next/link";

import { ConnectWallet } from "@/components/connect-wallet";

export function Header() {
  return (
    <header className="border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-300">
            <span className="font-mono text-lg font-bold">H</span>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide">HELIQUANT</p>
            <p className="text-xs text-neutral-400">
              Multi-source intelligence on Mantle
            </p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-neutral-300">
          <Link href="/firms/heliquant" className="hover:text-emerald-300">
            Firm
          </Link>
          <Link href="/whales" className="hover:text-emerald-300">
            Whales
          </Link>
          <Link href="/jobs/new" className="hover:text-emerald-300">
            Hire
          </Link>
          <ConnectWallet />
        </nav>
      </div>
    </header>
  );
}
