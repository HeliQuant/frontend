/**
 * /jobs/new → /hire
 *
 * The old static "hire" mockup lived here (disabled form, pre-wagmi). The REAL on-chain
 * deposit product (faucet → approve → hire → dashboard → settle) ships at /hire; /app is
 * now the live trading floor. One canonical surface each, no stale duplicate.
 */

import { redirect } from "next/navigation";

export default function NewJobPage() {
  redirect("/hire");
}
