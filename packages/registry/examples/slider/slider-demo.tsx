import { Slider } from "@/registry/base/ui/slider";

export default function SliderDemo() {
  return (
    <div className="flex w-96 max-w-full flex-col gap-8">
      <Slider defaultValue={40} />
      <Slider defaultValue={[20, 60]} />
    </div>
  );
}
