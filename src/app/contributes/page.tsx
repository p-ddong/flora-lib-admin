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

const ContributesPage = () => {
  const contributions = useSelector((state: RootState) => state.contribute.list);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = useMemo(() => {
    let list = [...contributions];

    if (selectedStatus) {
      list = list.filter((c) => c.status === selectedStatus);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.user.username.toLowerCase().includes(s) ||
          c.contribute_plant.scientific_name.toLowerCase().includes(s)
      );
    }

    list.sort((a, b) =>
      sortAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return list;
  }, [contributions, selectedStatus, search, sortAsc]);

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Contributes</h1>

      {/* Filter & Search */}
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search by user or scientific name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
          {filtered.map((c) => (
            <TableRow key={c._id}>
              <TableCell>{c.user.username}</TableCell>
              <TableCell>{c.contribute_plant.scientific_name}</TableCell>
              <TableCell className="capitalize">{c.type}</TableCell>
              <TableCell className="capitalize">{c.status}</TableCell>
              <TableCell>{format(new Date(c.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
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
                    // TODO: add delete logic
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
    </div>
  );
};

export default ContributesPage;

