import { SmartViewList } from "../SmartViewList";
import { useTodayView } from "../useViews";

export function TodayViewPage() {
  const { data, isLoading } = useTodayView();
  if (isLoading || !data) return <p className="text-sm text-muted-foreground">Loading...</p>;
  return (
    <SmartViewList
      sections={[
        { label: "Overdue", tasks: data.overdue },
        { label: "Due today", tasks: data.dueToday },
        { label: "Starting today", tasks: data.startingToday },
      ]}
    />
  );
}
