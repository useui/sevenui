import { Slider } from "@/registry/base/ui/slider";

export default function SliderMultiple() {
  return (
    <div className="w-96 max-w-full">
      <Slider defaultValue={[20, 50, 80]} />
    </div>
  );
}
