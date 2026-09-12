import { Slider } from "@/registry/base/ui/slider";

export default function SliderDisabled() {
  return (
    <div className="flex w-96 max-w-full flex-col gap-8">
      <Slider defaultValue={[60]} disabled />
      <Slider defaultValue={[20, 60]} disabled />
    </div>
  );
}
