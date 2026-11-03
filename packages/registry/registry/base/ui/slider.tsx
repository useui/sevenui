import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: SliderPrimitive.Root.Props) {
  // Base UI defaults an uncontrolled slider to the scalar `min`, so the
  // no-value fallback is a single thumb (a [min, max] fallback would render
  // two thumbs both bound to that scalar).
  const _values = Array.isArray(value)
    ? value
    : Array.isArray(defaultValue)
      ? defaultValue
      : [min];

  return (
    <SliderPrimitive.Root
      className={cn(
        // The thumb size steps with density through --slider-thumb.
        "[--slider-thumb:0.875rem] [[data-density=compact]_&]:[--slider-thumb:0.75rem] data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full",
        className,
      )}
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-hairline-strong select-none data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-brand select-none data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            key={index}
            // Base UI focuses the nested <input type="range">, so the ring
            // follows has-focus-visible on the thumb rather than focus-visible.
            className="relative block size-(--slider-thumb) shrink-0 rounded-full bg-white shadow-raised ring-1 ring-hairline-strong outline-none select-none [:where(&)]:[--focus-gap:2px] [:where(&)]:[--focus-width:1.5px] after:absolute after:-inset-2 has-focus-visible:focus-ring data-disabled:pointer-events-none disabled:pointer-events-none disabled:opacity-50"
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
