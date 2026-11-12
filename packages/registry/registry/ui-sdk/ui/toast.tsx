"use client";

import * as React from "react";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import {
  ToastAction as ToastActionPrimitive,
  ToastClose as ToastClosePrimitive,
  type ToastData,
  ToastDescription as ToastDescriptionPrimitive,
  type ToastItem,
  type ToastOptions,
  Toast as ToastPrimitive,
  ToastRegion as ToastRegionPrimitive,
  type ToastState,
  ToastTitle as ToastTitlePrimitive,
  type ToastType,
  createToaster,
} from "@ui-sdk/react/toast";
import { cn } from "cn";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/registry/ui-sdk/ui/button";

// SevenUI's toast API is Base UI's toast manager: `add`, `close`, `update`
// and `promise`, a provider, and `useToastManager().toasts` mapped onto
// `<Toast toast={…}>` parts. Here each manager drives its own UI SDK toaster
// (`createToaster()`), and the manager's toast object rides along in the UI
// SDK toast's `data`, so the parts and the hook read it back from there.

type BaseRender = React.ReactElement<unknown> | RenderProp<never>;
type Toaster = ReturnType<typeof createToaster<React.ReactNode>>;

// biome-ignore lint/suspicious/noExplicitAny: Base UI types toast data as any.
interface ToastObject<Data extends object = any> {
  id: string;
  title?: React.ReactNode;
  type?: string | undefined;
  description?: React.ReactNode;
  /** Milliseconds before it closes on its own; `0` keeps it open. */
  timeout?: number | undefined;
  priority?: "low" | "high" | undefined;
  transitionStatus?: "starting" | "ending" | undefined;
  updateKey?: number | undefined;
  limited?: boolean | undefined;
  height?: number | undefined;
  ref?: React.RefObject<HTMLElement | null> | undefined;
  onClose?: (() => void) | undefined;
  onRemove?: (() => void) | undefined;
  actionProps?: React.ComponentPropsWithoutRef<"button"> | undefined;
  /** Base UI's anchored toasts. Accepted for API parity; UI SDK has none. */
  positionerProps?: Record<string, unknown> | undefined;
  data?: Data | undefined;
}

type ToastManagerAddOptions<Data extends object> = Omit<
  ToastObject<Data>,
  "id" | "height" | "ref" | "limited" | "updateKey"
> & { id?: string | undefined };

type ToastManagerUpdateOptions<Data extends object> = Partial<
  Omit<ToastObject<Data>, "id" | "ref" | "height" | "transitionStatus" | "limited" | "updateKey">
>;

type PromiseMessage<Value, Data extends object> =
  | string
  | ToastManagerUpdateOptions<Data>
  | ((result: Value) => string | ToastManagerUpdateOptions<Data>);

interface ToastManagerPromiseOptions<Value, Data extends object> {
  loading: string | ToastManagerUpdateOptions<Data>;
  success: PromiseMessage<Value, Data>;
  // biome-ignore lint/suspicious/noExplicitAny: Base UI types the rejection as any.
  error: PromiseMessage<any, Data>;
}

// biome-ignore lint/suspicious/noExplicitAny: Base UI types toast data as any.
interface ToastManager<Data extends object = any> {
  add: <T extends Data = Data>(options: ToastManagerAddOptions<T>) => string;
  close: (id?: string) => void;
  update: <T extends Data = Data>(id: string, updates: ToastManagerUpdateOptions<T>) => void;
  promise: <Value, T extends Data = Data>(
    promise: Promise<Value>,
    options: ToastManagerPromiseOptions<Value, T>,
  ) => Promise<Value>;
}

type Manager = ToastManager & {
  toaster: Toaster;
  // The provider's `timeout`, for toasts that set none (Base UI's default).
  timeout: number;
};

const types = new Set<string>(["success", "error", "info", "warning", "loading"]);

function recordOf(toast: ToastData<unknown> | undefined): ToastObject | undefined {
  return (toast?.data as { record?: ToastObject } | undefined)?.record;
}

let counter = 0;

// biome-ignore lint/suspicious/noExplicitAny: Base UI types toast data as any.
function createToastManager<Data extends object = any>(): ToastManager<Data> {
  const toaster = createToaster<React.ReactNode>();
  const manager = { toaster, timeout: 5000 } as Manager;

  const find = (id: string) => recordOf(toaster.toasts().find((t) => t.id === id));

  // Base UI's `timeout: 0` and loading toasts stay until closed; its
  // priorities map onto UI SDK's announcements (Base UI is polite unless
  // told otherwise, errors included).
  const show = (record: ToastObject): ToastOptions<React.ReactNode> => {
    const timeout = record.timeout ?? manager.timeout;
    return {
      id: record.id,
      title: record.title,
      description: record.description,
      type: types.has(record.type ?? "") ? (record.type as ToastType) : "default",
      duration: record.type === "loading" || timeout <= 0 ? Infinity : timeout,
      priority: record.priority === "high" ? "assertive" : "polite",
      // UI SDK renders an action part only for a toast that has an action.
      action:
        record.actionProps?.children != null
          ? { label: record.actionProps.children, dismiss: false }
          : undefined,
      data: { record },
      onDismiss: () => {
        record.onClose?.();
        record.onRemove?.();
      },
    };
  };

  manager.add = (options) => {
    const existing = options.id ? find(options.id) : undefined;
    if (existing) {
      const record = { ...existing, ...options, id: existing.id };
      record.updateKey = (existing.updateKey ?? 0) + 1;
      toaster.update(record.id, show(record));
      return record.id;
    }
    const record: ToastObject = {
      ...options,
      id: options.id ?? `toast-${++counter}`,
      updateKey: 0,
    };
    return toaster(show(record));
  };

  manager.update = (id, updates) => {
    const existing = find(id);
    if (!existing) return;
    toaster.update(
      id,
      show({ ...existing, ...updates, id, updateKey: (existing.updateKey ?? 0) + 1 }),
    );
  };

  manager.close = (id) => toaster.dismiss(id);

  // Base UI turns a plain string into the description, and types the toast
  // loading, then success or error.
  const resolve = <Value, D extends object>(message: PromiseMessage<Value, D>, result?: Value) => {
    const value = typeof message === "function" ? message(result as Value) : message;
    return typeof value === "string" ? { description: value } : value;
  };

  manager.promise = (promise, options) => {
    const id = manager.add({ ...resolve(options.loading), type: "loading" });
    return promise.then(
      (result) => {
        const success = resolve(options.success, result);
        manager.update(id, { ...success, type: "success", timeout: success.timeout });
        return result;
      },
      (error) => {
        const failure = resolve(options.error, error);
        manager.update(id, { ...failure, type: "error", timeout: failure.timeout });
        return Promise.reject(error);
      },
    );
  };

  return manager as ToastManager<Data>;
}

const toast = createToastManager();

type ProviderValue = { manager: Manager; limit: number };
const ProviderContext = React.createContext<ProviderValue | null>(null);
// Inside the viewport the hook lists what the region shows, closing toasts
// included (Base UI's `transitionStatus: "ending"`), so exits animate.
const RegionContext = React.createContext<readonly ToastItem[] | null>(null);
const ItemContext = React.createContext<ToastItem | null>(null);
const RootContext = React.createContext<{ record: ToastObject; state: ToastState } | null>(
  null,
);

function ToastProvider({
  children,
  toastManager,
  limit = 3,
  timeout = 5000,
}: {
  children?: React.ReactNode;
  toastManager?: ToastManager;
  limit?: number;
  timeout?: number;
}) {
  const [own] = React.useState(() => createToastManager());
  const manager = (toastManager ?? own) as Manager;
  manager.timeout = timeout;
  const value = React.useMemo(() => ({ manager, limit }), [manager, limit]);
  return <ProviderContext.Provider value={value}>{children}</ProviderContext.Provider>;
}

function useProvider() {
  const context = React.useContext(ProviderContext);
  if (!context) {
    throw new Error("useToastManager must be used within a ToastProvider.");
  }
  return context;
}

// biome-ignore lint/suspicious/noExplicitAny: Base UI types toast data as any.
function useToastManager<Data extends object = any>(): ToastManager<Data> & {
  toasts: ToastObject<Data>[];
} {
  const { manager } = useProvider();
  const region = React.useContext(RegionContext);
  const queued = React.useSyncExternalStore(
    manager.toaster.subscribe,
    manager.toaster.toasts,
    manager.toaster.toasts,
  );
  const toasts = React.useMemo(() => {
    const list: ToastObject<Data>[] = [];
    if (region) {
      for (const item of region) {
        const record = recordOf(item.toast);
        if (record) {
          list.push({
            ...record,
            transitionStatus: item.leaving ? "ending" : undefined,
          } as ToastObject<Data>);
        }
      }
    } else {
      for (const queuedToast of queued) {
        const record = recordOf(queuedToast);
        if (record) list.push(record as ToastObject<Data>);
      }
    }
    return list;
  }, [region, queued]);
  return {
    toasts,
    add: manager.add,
    close: manager.close,
    update: manager.update,
    promise: manager.promise,
  };
}

// UI SDK renders popups in place in the top layer, so there is nothing to
// portal; the part stays so composed markup keeps working.
function ToastPortal({
  children,
}: {
  children?: React.ReactNode;
  container?: unknown;
  keepMounted?: boolean;
}) {
  return <>{children}</>;
}

// The viewport is UI SDK's toast region. The region renders its children once
// per toast, so the viewport's children (a list mapping
// `useToastManager().toasts` to `<Toast>`s) run once per toast, and each
// `<Toast>` renders only for the toast the region is rendering. The region is
// a top-layer popover whose reset is keyed to its own slot (toast-region), so
// top-auto, overflow-visible, bg-transparent and text-inherit undo the
// popover's inset, scrolling and colours.
function ToastViewport({
  className,
  children,
  render,
  ...props
}: Omit<
  React.ComponentProps<typeof ToastRegionPrimitive>,
  "children" | "className" | "render" | "toaster" | "maxVisible"
> & {
  className?: string;
  children?: React.ReactNode;
  render?: BaseRender;
}) {
  const { manager, limit } = useProvider();
  return (
    <ToastRegionPrimitive
      toaster={manager.toaster}
      maxVisible={limit}
      side="bottom"
      align="end"
      render={(regionProps, state) => (
        <RegionContext.Provider value={state.toasts}>
          {renderElement(
            "section",
            { ...regionProps, "data-slot": "toast-viewport" },
            render as RenderProp<typeof state> | undefined,
            state,
          )}
        </RegionContext.Provider>
      )}
      className={cn(
        "pointer-events-none fixed inset-x-4 top-auto bottom-4 z-50 mx-auto w-auto max-w-sm overflow-visible bg-transparent text-inherit outline-none sm:right-4 sm:left-auto sm:mx-0 sm:w-full",
        className,
      )}
      {...props}
    >
      {(_toast, item) => <ItemContext.Provider value={item}>{children}</ItemContext.Provider>}
    </ToastRegionPrimitive>
  );
}

// Base UI's stack variables, defined from UI SDK's, so the base classes below
// work unchanged: swipe movement, the offset of the toasts in front, and the
// frontmost height.
const baseVariables =
  "[--toast-swipe-movement-x:var(--toast-swipe-x,0px)] [--toast-swipe-movement-y:var(--toast-swipe-y,0px)] [--toast-offset-y:var(--toast-offset,0px)] [--toast-frontmost-height:var(--toast-front-height)]";

function Toast({
  className,
  toast: record,
  swipeDirection: _swipeDirection,
  render,
  ...props
}: Omit<React.ComponentProps<typeof ToastPrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
  toast: ToastObject;
  // UI SDK swipes toward the region's edge; there is no per-toast direction.
  swipeDirection?: "up" | "down" | "left" | "right" | ("up" | "down" | "left" | "right")[];
}) {
  const item = React.useContext(ItemContext);
  if (item?.toast.id !== record.id) return null;
  return (
    <ToastPrimitive
      render={(toastProps, state) => (
        <RootContext.Provider value={{ record, state }}>
          {renderElement(
            "li",
            { ...toastProps, "data-slot": "toast" },
            render as RenderProp<ToastState> | undefined,
            state,
          )}
        </RootContext.Provider>
      )}
      className={cn(
        baseVariables,
        "group/toast pointer-events-auto absolute right-0 bottom-0 z-[calc(1000-var(--toast-index))] w-full origin-bottom rounded-xl border bg-popover text-popover-foreground shadow-overlay will-change-transform outline-none select-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
        "h-(--height) [transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))] [transition:transform_500ms_cubic-bezier(0.22,1,0.36,1),opacity_500ms,height_150ms]",
        "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
        "data-expanded:h-(--toast-height) data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]",
        "data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
        "motion-reduce:[transition:opacity_200ms] motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:opacity-0",
        // Reduced motion is a pure fade: pin the entering/leaving toast to its resting transform.
        "motion-reduce:data-starting-style:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]! motion-reduce:data-ending-style:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]!",
        "motion-reduce:data-expanded:data-starting-style:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]! motion-reduce:data-expanded:data-ending-style:[transform:translateX(var(--toast-swipe-movement-x))_translateY(var(--offset-y))]!",
        "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
        "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
        "data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
        "data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
        className,
      )}
      {...props}
    />
  );
}

// Base UI marks the toasts behind the front one with data-behind and an
// expanded stack with data-expanded, on the content as on the root.
function ToastContent({ className, ...props }: React.ComponentProps<"div">) {
  const state = React.useContext(RootContext)?.state;
  return (
    <div
      data-slot="toast-content"
      data-behind={state && !state.front ? "" : undefined}
      data-expanded={state?.expanded ? "" : undefined}
      className={cn(
        "flex h-full items-center gap-3 overflow-hidden p-[var(--panel-pad,1.125rem)] transition-opacity duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function ToastTitle({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToastTitlePrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ToastTitlePrimitive
      data-slot="toast-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function ToastDescription({
  className,
  ...props
}: Omit<React.ComponentProps<typeof ToastDescriptionPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <ToastDescriptionPrimitive
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

// Base UI's action takes its props from the toast's `actionProps` and renders
// only with children. UI SDK renders its action part only for a toast whose
// data has an action, so a toast without `actionProps` gets a plain button.
// Pressing it never closes the toast, as in Base UI.
function ToastAction({
  className,
  render = <Button variant="outline" size="xs" />,
  children,
  ...props
}: Omit<React.ComponentProps<typeof ToastActionPrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  const record = React.useContext(RootContext)?.record;
  const { children: actionChildren, ...actionProps } = record?.actionProps ?? {};
  const content = actionChildren ?? children;
  if (content == null || content === false || content === "") return null;
  const merged = {
    ...props,
    ...actionProps,
    className: cn("shrink-0", className, actionProps.className),
  };
  if (!record?.actionProps) {
    return renderElement(
      "button",
      { type: "button", ...merged, "data-slot": "toast-action", children: content },
      render as RenderProp<Record<string, never>>,
      {},
    );
  }
  return (
    <ToastActionPrimitive
      dismiss={false}
      render={(actionPartProps, state) =>
        renderElement(
          "button",
          { ...actionPartProps, "data-slot": "toast-action" },
          render as RenderProp<typeof state>,
          state,
        )
      }
      {...(merged as React.ComponentProps<typeof ToastActionPrimitive>)}
    >
      {content}
    </ToastActionPrimitive>
  );
}

function ToastClose({
  className,
  children,
  render = <Button variant="ghost" size="icon-sm" />,
  ...props
}: Omit<React.ComponentProps<typeof ToastClosePrimitive>, "className" | "render"> & {
  className?: string;
  render?: BaseRender;
}) {
  return (
    <ToastClosePrimitive
      aria-label="Close toast"
      render={(closeProps, state) =>
        renderElement(
          "button",
          { ...closeProps, "data-slot": "toast-close" },
          render as RenderProp<typeof state>,
          state,
        )
      }
      className={cn(
        "relative shrink-0 text-muted-foreground after:absolute after:-inset-2 after:content-[''] hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden="true" />}
    </ToastClosePrimitive>
  );
}

function ToastIcon({ type }: { type: string | undefined }) {
  let icon: React.ReactNode = null;

  if (type === "success") {
    icon = <CircleCheckIcon className="text-success" aria-hidden="true" />;
  }

  if (type === "info") {
    icon = <InfoIcon className="text-muted-foreground" aria-hidden="true" />;
  }

  if (type === "warning") {
    icon = <TriangleAlertIcon className="text-warning" aria-hidden="true" />;
  }

  if (type === "error") {
    icon = <OctagonXIcon className="text-destructive" aria-hidden="true" />;
  }

  if (type === "loading") {
    icon = (
      <Loader2Icon
        className="animate-spin text-muted-foreground"
        aria-hidden="true"
      />
    );
  }

  if (!icon) {
    return null;
  }

  return (
    <span
      data-slot="toast-icon"
      className="shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4"
    >
      {icon}
    </span>
  );
}

function ToastList() {
  const { toasts } = useToastManager();

  return toasts.map((toastItem) => (
    <Toast key={toastItem.id} toast={toastItem}>
      <ToastContent>
        <ToastIcon type={toastItem.type} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ToastTitle />
          <ToastDescription />
        </div>
        <ToastAction />
        <ToastClose />
      </ToastContent>
    </Toast>
  ));
}

function Toaster({
  children,
  toastManager = toast,
  ...props
}: React.ComponentProps<typeof ToastProvider>) {
  return (
    <ToastProvider toastManager={toastManager} {...props}>
      {children}
      <ToastPortal>
        <ToastViewport>
          <ToastList />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>
  );
}

export {
  Toaster,
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  toast,
  useToastManager,
};
