import { cn } from "@/lib/cn";
import type { TrafficLight } from "./types";

const STYLES: Record<TrafficLight, string> = {
  "on-track": "bg-green-500/20 text-green-400",
  "at-risk": "bg-yellow-500/20 text-yellow-400",
  "off-track": "bg-red-500/20 text-red-400",
};

const LABELS: Record<TrafficLight, string> = {
  "on-track": "On track",
  "at-risk": "At risk",
  "off-track": "Off track",
};

export function TrafficLightBadge({ status }: { status: TrafficLight }) {
  return <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", STYLES[status])}>{LABELS[status]}</span>;
}
