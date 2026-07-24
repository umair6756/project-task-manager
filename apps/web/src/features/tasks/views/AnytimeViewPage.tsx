import { SmartViewList } from "../SmartViewList";
import { useAnytimeView } from "../useViews";

export function AnytimeViewPage() {
  const { data, isLoading } = useAnytimeView();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading...</p>;
  return <SmartViewList sections={[{ label: "Anytime (no due/start date)", tasks: data.tasks }]} />;
}
