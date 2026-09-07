import { Slider } from "@/registry/base/ui/slider";

export default function SliderVertical() {
  return (
    <div className="flex h-48 items-stretch gap-8">
      <Slider orientation="vertical" defaultValue={[60]} />
      <Slider orientation="vertical" defaultValue={[20, 80]} />
    </div>
  );
}
