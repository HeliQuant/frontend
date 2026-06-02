import { ConnectWallet } from "@/components/connect-wallet";

const NAV = [
  { href: "#org", label: "Live org" },
  { href: "#edge", label: "The edge" },
  { href: "#findings", label: "Findings" },
  { href: "#ledger", label: "Ledger" },
  { href: "#architecture", label: "Architecture" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-deep-cosmos/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-chartreuse font-mono text-sm font-bold text-midnight-navy">
            H
          </span>
          <span className="font-display text-lg text-white">HeliQuant</span>
        </a>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="text-sm text-ice-veil/70 transition-colors hover:text-white"
            >
              {n.label}
            </a>
          ))}
        </nav>
        <ConnectWallet />
      </div>
    </header>
  );
}
