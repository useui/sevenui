import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/registry/base/ui/pagination";

export default function PaginationSimple() {
  return (
    <Pagination>
      <PaginationContent className="w-full max-w-xs justify-between">
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <span className="text-sm text-muted-foreground">Page 2 of 10</span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
