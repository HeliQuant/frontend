import CampaignView from "@/components/garage/CampaignView";
import { OWNER_ENGINE_URL } from "@/lib/engine";

/** /campaign — the Owner showcase floor: always reads the founder's 24/7 Railway engine (public). */
export default function CampaignPage() {
  return <CampaignView base={OWNER_ENGINE_URL} mode="owner" />;
}
