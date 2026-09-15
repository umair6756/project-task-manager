import { AnimatePresence, motion } from "framer-motion";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";

// Thin gradient bar under the topbar while any query/mutation is in flight —
// gives constant, ambient feedback that the app is "alive" (ClickUp-style).
export function TopProgressBar() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const active = fetching + mutating > 0;

  return (
    <div className="h-[2px] w-full overflow-hidden bg-transparent">
      <AnimatePresence>
        {active && (
          <motion.div
            key="bar"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
            className="h-full w-full bg-gradient-to-r from-primary via-fuchsia-400 to-primary"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
