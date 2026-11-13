"use client";

import * as React from "react";
import {
  Avatar as AvatarPrimitive,
  AvatarFallback as AvatarFallbackPrimitive,
  AvatarImage as AvatarImagePrimitive,
  type AvatarLoadingStatus,
} from "@ui-sdk/react/avatar";
import { type RenderProp, renderElement } from "@ui-sdk/react/primitive";
import { cn } from "cn";

type AvatarProps = React.ComponentProps<typeof AvatarPrimitive>;
type StatusChange = NonNullable<AvatarProps["onLoadingStatusChange"]>;

// UI SDK ignores a data-slot prop on its parts; one on the rendered element
// wins. So the slot is set there: a caller's own data-slot, which replaced
// the default in Base UI, or the default. A caller's `render` still renders.
function slotted<P extends object>(
  slot: string | undefined,
  tag: string,
  props: P,
): P {
  const {
    "data-slot": own,
    render,
    ...rest
  } = props as P & { "data-slot"?: string; render?: RenderProp<never> };
  const name = own ?? slot;
  return {
    ...rest,
    render: (partProps: Record<string, unknown>, state: never) =>
      renderElement(
        tag,
        name ? { ...partProps, "data-slot": name } : partProps,
        render,
        state,
      ),
  } as P;
}

// Base UI reports the loading status on the image; UI SDK on the root. The
// image hands its callback to the root through this ref.
const ImageStatusContext = React.createContext<React.RefObject<
  ((status: AvatarLoadingStatus) => void) | undefined
> | null>(null);

function Avatar({
  className,
  size = "default",
  onLoadingStatusChange,
  ...props
}: Omit<AvatarProps, "className"> & {
  className?: string;
  size?: "default" | "sm" | "lg";
}) {
  const imageStatus = React.useRef<
    ((status: AvatarLoadingStatus) => void) | undefined
  >(undefined);
  const handleStatus: StatusChange = (status, details) => {
    imageStatus.current?.(status);
    onLoadingStatusChange?.(status, details);
  };
  return (
    <ImageStatusContext.Provider value={imageStatus}>
      <AvatarPrimitive
        onLoadingStatusChange={handleStatus}
        data-size={size}
        className={cn(
          "group/avatar relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken data-[size=lg]:size-10 data-[size=sm]:size-6 dark:after:mix-blend-lighten",
          className,
        )}
        {...slotted("avatar", "span", props)}
      />
    </ImageStatusContext.Provider>
  );
}

function AvatarImage({
  className,
  onLoadingStatusChange,
  ...props
}: Omit<React.ComponentProps<typeof AvatarImagePrimitive>, "className"> & {
  className?: string;
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
}) {
  const imageStatus = React.useContext(ImageStatusContext);
  const [loaded, setLoaded] = React.useState(false);
  const [entered, setEntered] = React.useState(false);
  React.useLayoutEffect(() => {
    if (!imageStatus) return;
    imageStatus.current = (status) => {
      setLoaded(status === "loaded");
      onLoadingStatusChange?.(status);
    };
    return () => {
      imageStatus.current = undefined;
    };
  }, [imageStatus, onLoadingStatusChange]);
  // Base UI mounts the image once it loads with data-starting-style for one
  // frame, so a transition can fade it in. UI SDK renders the image at once,
  // so the flavour marks the frame it becomes visible instead.
  React.useEffect(() => {
    if (!loaded) {
      setEntered(false);
      return;
    }
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [loaded]);
  return (
    <AvatarImagePrimitive
      className={cn(
        "aspect-square size-full rounded-full object-cover",
        className,
      )}
      {...slotted("avatar-image", "img", {
        ...props,
        ...(loaded && !entered ? { "data-starting-style": "" } : {}),
      })}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: Omit<React.ComponentProps<typeof AvatarFallbackPrimitive>, "className"> & {
  className?: string;
}) {
  return (
    <AvatarFallbackPrimitive
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        className,
      )}
      {...slotted("avatar-fallback", "span", props)}
    />
  );
}

function AvatarBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="avatar-badge"
      className={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group"
      className={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        className,
      )}
      {...props}
    />
  );
}

function AvatarGroupCount({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-group-count"
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
};
