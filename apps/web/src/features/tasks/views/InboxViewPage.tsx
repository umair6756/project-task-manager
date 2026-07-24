import { SmartViewList } from "../SmartViewList";
import { QuickAddBar } from "../QuickAddBar";
import { useInboxView } from "../useViews";

export function InboxViewPage() {
  const { data, isLoading } = useInboxView();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <QuickAddBar />
      {isLoading || !data ? <p className="text-sm text-muted-foreground">Loading...</p> : <SmartViewList sections={[{ label: "Inbox (no project)", tasks: data.tasks }]} />}
    </div>
  );
}
