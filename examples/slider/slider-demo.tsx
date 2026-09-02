import { Slider } from "@/registry/base/ui/slider";

export default function SliderDemo() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-8">
      <Slider defaultValue={40} className="w-full max-w-sm" />
      <Slider defaultValue={[20, 60]} />
    </div>
  );
}
