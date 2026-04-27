"use client";

/**
 * Forward-only View Transitions provider + hook.
 *
 * Replaces the `next-view-transitions` package's `<ViewTransitions>`
 * component AND its `useTransitionRouter` hook with thin local equivalents
 * that DO NOT subscribe to `popstate`. Browser back/forward navigations
 * now go through Next.js's standard router with no `startViewTransition`
 * wrapper — the user no longer waits for a 380 ms crossfade plus the
 * suspended-render screenshot pause that the package imposed on every
 * popstate event.
 *
 * Forward navigations (link clicks via `useTransitionRouter().push()` and
 * `<TransitionLink>`) keep their full View Transition treatment: the
 * crossfade in `globals.css` ::view-transition-old/new(root) and the
 * shared-element morphs (e.g. `viewTransitionName: hero-photo` between
 * the homepage hero and the CV) all still work.
 *
 * The package source we replace lives at
 * `node_modules/next-view-transitions/dist/index.js`. The two pieces we
 * intentionally drop:
 *
 *   1. `useBrowserNativeTransitions()` — its `onPopState` handler called
 *      `document.startViewTransition` on every browser back, which
 *      *suspended the new route's render* via React 19's `use()` until
 *      the screenshot was captured, then animated the 380 ms crossfade.
 *      That suspended render is what made browser-back feel slow.
 *
 *   2. The `<Link>` re-export — we already use `<TransitionLink>` which
 *      composes `next-intl`'s locale-aware `Link` with our local
 *      `useTransitionRouter`, so the package's `Link` was never used.
 *
 * What we keep, byte-for-byte equivalent to the package:
 *
 *   - The `setFinishViewTransition` state-setter context, which lets
 *     `useTransitionRouter` resolve the in-flight transition's promise
 *     in a `useEffect` after the new route commits. This guarantees the
 *     view transition only finishes once React has actually mounted the
 *     destination, preventing the "blank flash" that would happen if we
 *     resolved the promise before the new DOM was in place.
 *   - The `useTransitionRouter().push/replace` API + `onTransitionReady`
 *     callback shape, so existing callers don't need any code change
 *     beyond swapping their import path.
 */

import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Callback that resolves the in-flight transition's inner promise, telling
 * the browser the new DOM is ready for the "after" screenshot. Stored in
 * a ref so the post-commit effect doesn't have to setState during cleanup.
 */
type FinishCallback = () => void;

/** Schedule a finish callback to run after the next React commit. */
type EnqueueFinish = (cb: FinishCallback) => void;

const ViewTransitionsContext = createContext<EnqueueFinish | null>(null);

/**
 * Wraps the app tree. Provides the context needed by `useTransitionRouter`
 * to coordinate finishing a view transition with the next React commit.
 *
 * Crucially, this provider does NOT subscribe to `popstate`, which is the
 * behaviour difference vs the package's `<ViewTransitions>`.
 *
 * Implementation note: the upstream package stores the finish callback in
 * `useState`, then `setFinishViewTransition(null)` inside the effect to
 * clear it. Under React 19 that pattern trips the
 * `react-hooks/set-state-in-effect` lint. We achieve the same
 * "fire-once-per-navigation" behaviour by storing the callback in a ref
 * (cleared synchronously inside the effect, no re-render) and using a
 * monotonically-increasing tick state purely as the effect trigger.
 */
export function ViewTransitionsProvider({ children }: { children: ReactNode }) {
  const finishRef = useRef<FinishCallback | null>(null);
  const [tick, setTick] = useState(0);

  const enqueue = useCallback<EnqueueFinish>((cb) => {
    finishRef.current = cb;
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    const fn = finishRef.current;
    if (fn) {
      finishRef.current = null;
      fn();
    }
  }, [tick]);

  return (
    <ViewTransitionsContext.Provider value={enqueue}>
      {children}
    </ViewTransitionsContext.Provider>
  );
}

function useEnqueueFinish(): EnqueueFinish {
  const ctx = use(ViewTransitionsContext);
  if (!ctx) {
    throw new Error(
      "useTransitionRouter must be used inside <ViewTransitionsProvider>",
    );
  }
  return ctx;
}

interface PushOptions {
  scroll?: boolean;
  onTransitionReady?: () => void;
}

type NextRouter = ReturnType<typeof useRouter>;

interface TransitionRouter extends NextRouter {
  push: (href: string, options?: PushOptions) => void;
  replace: (href: string, options?: PushOptions) => void;
}

/**
 * Forward-only `useTransitionRouter`. API-compatible with the
 * `next-view-transitions` package: `.push(href)` and `.replace(href)` wrap
 * the navigation in `document.startViewTransition`, falling back to a
 * plain navigation when the browser doesn't support it.
 */
export function useTransitionRouter(): TransitionRouter {
  const router = useRouter();
  const enqueueFinish = useEnqueueFinish();

  const triggerTransition = useCallback(
    (cb: () => void, opts: PushOptions = {}) => {
      if (typeof document !== "undefined" && "startViewTransition" in document) {
        const transition = document.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              startTransition(() => {
                cb();
                // Hand `resolve` to the provider; it fires the callback
                // after React commits the new route, which is exactly
                // when we want the browser to take the "after" screenshot
                // and start animating the transition.
                enqueueFinish(resolve);
              });
            }),
        );
        if (opts.onTransitionReady) {
          transition.ready.then(opts.onTransitionReady);
        }
      } else {
        cb();
      }
    },
    [enqueueFinish],
  );

  const push = useCallback(
    (href: string, options: PushOptions = {}) => {
      const { onTransitionReady, ...rest } = options;
      triggerTransition(() => router.push(href, rest), { onTransitionReady });
    },
    [triggerTransition, router],
  );

  const replace = useCallback(
    (href: string, options: PushOptions = {}) => {
      const { onTransitionReady, ...rest } = options;
      triggerTransition(() => router.replace(href, rest), { onTransitionReady });
    },
    [triggerTransition, router],
  );

  return useMemo(
    () => ({
      ...router,
      push,
      replace,
    }),
    [router, push, replace],
  );
}
