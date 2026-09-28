import { useCallback, useRef, useState } from "react";

export interface StepNavigationHandle {
  /** Returns false when the current page has no earlier local view. */
  goBack: () => boolean;
  snapshot: () => StepNavigationSnapshot;
}

export interface StepNavigationSnapshot {
  current: string;
  trail: string[];
}

/** Tracks the user's actual sequence through tabs or steps on one page. */
export function useStepNavigation<T extends string>(initial: T, restored?: StepNavigationSnapshot | null) {
  const [current, setCurrent] = useState<T>((restored?.current as T | undefined) ?? initial);
  const currentRef = useRef<T>((restored?.current as T | undefined) ?? initial);
  const trailRef = useRef<T[]>((restored?.trail as T[] | undefined)?.slice() ?? []);

  const navigate = useCallback((next: T) => {
    if (next === currentRef.current) return;
    trailRef.current.push(currentRef.current);
    currentRef.current = next;
    setCurrent(next);
  }, []);

  const goBack = useCallback(() => {
    const previous = trailRef.current.pop();
    if (previous === undefined) return false;
    currentRef.current = previous;
    setCurrent(previous);
    return true;
  }, []);

  const snapshot = useCallback((): StepNavigationSnapshot => ({
    current: currentRef.current,
    trail: [...trailRef.current],
  }), []);

  return { current, navigate, goBack, snapshot };
}
