"use client";

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
} from "@/registry/base/ui/combobox";
import { Label } from "@/registry/base/ui/label";

type Region = { value: string; label: string; city: string };
type RegionGroup = { value: string; items: Region[] };

const regionGroups: RegionGroup[] = [
  {
    value: "North America",
    items: [
      { value: "us-east-1", label: "US East", city: "N. Virginia" },
      { value: "us-west-2", label: "US West", city: "Oregon" },
      { value: "ca-central-1", label: "Canada Central", city: "Montreal" },
    ],
  },
  {
    value: "Europe",
    items: [
      { value: "eu-west-1", label: "EU West", city: "Dublin" },
      { value: "eu-central-1", label: "EU Central", city: "Frankfurt" },
      { value: "eu-north-1", label: "EU North", city: "Stockholm" },
    ],
  },
  {
    value: "Asia Pacific",
    items: [
      { value: "ap-southeast-1", label: "AP Southeast", city: "Singapore" },
      { value: "ap-northeast-1", label: "AP Northeast", city: "Tokyo" },
      { value: "ap-south-1", label: "AP South", city: "Mumbai" },
    ],
  },
];

export default function Combobox04() {
  return (
    <div className="grid w-full max-w-xs gap-2">
      <Label htmlFor="combobox-04-region">Deployment region</Label>
      <Combobox
        items={regionGroups}
        defaultValue={regionGroups[1].items[1]}
        itemToStringLabel={(region: Region) => `${region.label} (${region.city})`}
      >
        <ComboboxInput
          id="combobox-04-region"
          placeholder="Search by region or city"
          className="w-full"
        />
        <ComboboxContent>
          <ComboboxEmpty>No region in that location.</ComboboxEmpty>
          <ComboboxList>
            {(group: RegionGroup, index: number) => (
              <ComboboxGroup key={group.value} items={group.items}>
                {index > 0 ? <ComboboxSeparator /> : null}
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item: Region) => (
                    <ComboboxItem key={item.value} value={item}>
                      <span className="truncate">
                        {item.label}
                        <span className="text-muted-foreground"> · {item.city}</span>
                      </span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {item.value}
                      </span>
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
