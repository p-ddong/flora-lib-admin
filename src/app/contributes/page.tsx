"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";
import { Check, Eye, Trash2, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Contribution } from "@/types";

const PAGE_SIZE = 10;

const ContributesPage = () => {
  const contributions = useSelector(
    (state: RootState) => state.contribute.list
  );

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(false); // mới nhất trước
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let list: Contribution[] = [...contributions];

    if (selectedStatus) {
      list = list.filter((c) => c.status === selectedStatus);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.c_user.username.toLowerCase().includes(s) ||
          c.data.plant.scientific_name.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return list;
  }, [contributions, selectedStatus, search, sortAsc]);

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Contributions</h1>

      {/* Filter & Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search by user or scientific name..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          className="max-w-sm"
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="min-w-[200px] justify-between"
            >
              {selectedStatus || "Filter by Status"}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search status..." />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setSelectedStatus(null);
                    setOpen(false);
                  }}
                >
                  All Statuses
                </CommandItem>
                {["pending", "approved", "rejected"].map((status) => (
                  <CommandItem
                    key={status}
                    onSelect={() => {
                      setSelectedStatus(status);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        status === selectedStatus ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {status}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Button onClick={() => setSortAsc((prev) => !prev)} variant="outline">
          Sort by Date {sortAsc ? "↑" : "↓"}
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Scientific Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paged.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.c_user.username}</TableCell>
              <TableCell>{c.data.plant.scientific_name}</TableCell>
              <TableCell className="capitalize">{c.type}</TableCell>
              <TableCell
                className={`capitalize font-semibold ${
                  c.status === "approved"
                    ? "text-green-600"
                    : c.status === "rejected"
                    ? "text-red-600"
                    : "text-yellow-600"
                }`}
              >
                {c.status}
              </TableCell>
              <TableCell>
                {format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/contributes/${c._id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-600"
                  onClick={() => {
                    console.log("Delete contribution:", c._id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination controls */}
      <div className="flex justify-end items-center gap-2 pt-4">
        <Button
          variant="outline"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} / {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ContributesPage;
