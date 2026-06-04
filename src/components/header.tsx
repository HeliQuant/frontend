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
    <header
      className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl"
      style={{ backgroundColor: "rgba(10,10,10,0.72)" }}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5">
        <a href="#top" className="flex items-center gap-2.5">
          <span
            className="grid h-8 w-8 place-items-center rounded-full font-mono text-sm font-bold"
            style={{
              background: "radial-gradient(circle at 50% 38%, #ffd06a 0%, #fa520f 68%, #a1131a 100%)",
              color: "#0a0a0a",
              boxShadow: "0 0 14px -2px rgba(250,82,15,0.6)",
            }}
          >
            H
          </span>
          <span className="font-display text-lg" style={{ color: "#e0f6ff" }}>
            HeliQuant
          </span>
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
