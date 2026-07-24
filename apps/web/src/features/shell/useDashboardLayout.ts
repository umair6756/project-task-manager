import { useEffect, useState } from "react";

const STORAGE_KEY = "flowforge.dashboardLayout";

export const DEFAULT_WIDGET_ORDER = ["mits", "today", "habits", "goals", "level"] as const;
export type WidgetId = (typeof DEFAULT_WIDGET_ORDER)[number];

interface Layout {
  order: WidgetId[];
  hidden: WidgetId[];
}

function load(): Layout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: [...DEFAULT_WIDGET_ORDER], hidden: [] };
    const parsed = JSON.parse(raw) as Layout;
    // Merge in any new widgets added since the layout was last saved.
    const missing = DEFAULT_WIDGET_ORDER.filter((w) => !parsed.order.includes(w));
    return { order: [...parsed.order, ...missing], hidden: parsed.hidden ?? [] };
  } catch {
    return { order: [...DEFAULT_WIDGET_ORDER], hidden: [] };
  }
}

export function useDashboardLayout() {
  const [layout, setLayout] = useState<Layout>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }, [layout]);

  function reorder(order: WidgetId[]) {
    setLayout((l) => ({ ...l, order }));
  }

  function toggleHidden(id: WidgetId) {
    setLayout((l) => ({ ...l, hidden: l.hidden.includes(id) ? l.hidden.filter((h) => h !== id) : [...l.hidden, id] }));
  }

  return { order: layout.order, hidden: layout.hidden, reorder, toggleHidden };
}
