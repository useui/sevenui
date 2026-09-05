import type { SVGProps } from "react";

/** The SevenUI mark. Inherits `currentColor`; size it via `className`/`height`. */
export function Logomark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      height="1em"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M9.08426 12.4419C9.65668 8.91164 12.987 6.51285 16.5232 7.08412L49.549 12.4213C53.0852 12.9928 55.488 16.3176 54.9157 19.8479C54.3433 23.3782 51.013 25.7769 47.4768 25.2057L14.451 19.8685C10.9148 19.297 8.51204 15.9722 9.08426 12.4419Z"
        fill="currentColor"
      />
      <path
        d="M43.1816 15.1254C45.222 12.1858 49.2627 11.4541 52.2072 13.4911C55.1516 15.528 55.8845 19.562 53.8442 22.5016L25.5487 54.2121C23.5083 57.1517 19.4676 57.8834 16.5232 55.8464C13.5787 53.8095 12.8458 49.7755 14.8861 46.8359L43.1816 15.1254Z"
        fill="currentColor"
      />
    </svg>
  );
}
