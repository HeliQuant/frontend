/**
 * /jobs/new → /app
 *
 * The old static "hire" mockup lived here (disabled form, pre-wagmi). The REAL on-chain
 * deposit product (faucet → approve → hire → dashboard → settle) ships at /app — one
 * canonical surface, no stale duplicate.
 */

import { redirect } from "next/navigation";

export default function NewJobPage() {
  redirect("/app");
}
