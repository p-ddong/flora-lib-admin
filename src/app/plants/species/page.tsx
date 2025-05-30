"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Pencil, Trash, Check, ChevronsUpDown } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import PaginationControls from "@/components/PaginationControls/PaginationControls";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { deletePlantById } from "@/services/plant.service";
import { setPlantList } from "@/store/plantSlice";

type ViewType = "table" | "card";

const SpeciesPage = () => {
  const plants = useSelector((state: RootState) => state.plant.list);
  const dispatch = useDispatch();
  const [view, setView] = useState<ViewType>("table");
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [open, setOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState<string | null>(null);

  const itemsPerPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFamily, sortAsc]);

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const familyOptions = useMemo(() => {
    const set = new Set(plants.map((p) => p.family_name));
    return Array.from(set).sort();
  }, [plants]);

  const filtered = useMemo(() => {
    let list = [...plants];

    if (selectedFamily) {
      list = list.filter((p) => p.family_name === selectedFamily);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.scientific_name.toLowerCase().includes(term) ||
          p.common_name.some((name) => name.toLowerCase().includes(term))
      );
    }

    list.sort((a, b) =>
      sortAsc
        ? a.scientific_name.localeCompare(b.scientific_name)
        : b.scientific_name.localeCompare(a.scientific_name)
    );

    return list;
  }, [plants, selectedFamily, searchTerm, sortAsc]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleAllCurrentPage = () => {
    const ids = paginated.map((p) => p._id);
    const allSelected = ids.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  // const handleDeleteMany = () => {
  //   console.log("Deleted IDs:", selectedIds);
  //   setSelectedIds([]);
  //   setDeleteDialogOpen(false);
  // };

  const exportToCSV = () => {
    const selectedPlants = plants.filter((p) => selectedIds.includes(p._id));
    if (selectedPlants.length === 0) return;

    const header = ["scientific_name", "common_name", "family_name"];
    const rows = selectedPlants.map((plant) => [
      `"${plant.scientific_name}"`,
      `"${plant.common_name.join(", ")}"`,
      `"${plant.family_name}"`,
    ]);

    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "selected_species.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Species</h1>

      {/* Filter UI */}
      <div className="items-center space-y-2">
        <div className="space-x-2 flex items-center">
          <Input
            placeholder="Search by name..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <p>Total plant: {plants.length}</p>
        </div>
        <div className="flex flex-wrap gap-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="min-w-[200px] justify-between"
              >
                {selectedFamily || "Filter by Family"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search family..." />
                <CommandEmpty>No family found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setSelectedFamily(null);
                      setOpen(false);
                    }}
                  >
                    All Families
                  </CommandItem>
                  {familyOptions.map((family) => (
                    <CommandItem
                      key={family}
                      onSelect={() => {
                        setSelectedFamily(family);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          family === selectedFamily
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {family}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>

          <Button onClick={() => setSortAsc((prev) => !prev)} variant="outline">
            Sort by Scientific Name {sortAsc ? "↑" : "↓"}
          </Button>

          <Button
            variant={view === "table" ? "default" : "outline"}
            onClick={() => setView("table")}
          >
            Table View
          </Button>
          <Button
            variant={view === "card" ? "default" : "outline"}
            onClick={() => setView("card")}
          >
            Card View
          </Button>
          <Button className="bg-green-500">
            <Link href={`/plants/species/add`}>Add New Specie</Link>
          </Button>
          {selectedIds.length > 0 && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete ({selectedIds.length})
              </Button>
              <Button onClick={exportToCSV}>Export to CSV</Button>
            </>
          )}
        </div>
      </div>

      {/* Table View */}
      {view === "table" && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">
                <Checkbox
                  checked={paginated.every((p) => selectedIds.includes(p._id))}
                  onCheckedChange={toggleAllCurrentPage}
                />
              </TableHead>
              <TableHead>Scientific Name</TableHead>
              <TableHead>Family</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((plant) => (
              <TableRow key={plant._id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(plant._id)}
                    onCheckedChange={() => toggleSelect(plant._id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{plant.scientific_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {truncateText(plant.common_name.join(", "), 80)}
                  </div>
                </TableCell>
                <TableCell>{plant.family_name}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/plants/species/${plant._id}/view`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link href={`/plants/species/${plant._id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => {
                      setTargetToDelete(plant._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {view === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {paginated.map((plant) => (
            <div
              key={plant._id}
              className="border rounded-lg overflow-hidden shadow-sm bg-white"
            >
              {plant.image ? (
                <CldImage
                  src={plant.image}
                  alt={plant.scientific_name}
                  width={400}
                  height={160}
                  crop="fill"
                  gravity="auto"
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-[400px] h-[160px] bg-gray-400" />
              )}

              <div className="p-4 space-y-1">
                <div className="font-bold">{plant.scientific_name}</div>
                <div className="text-sm text-muted-foreground line-clamp-2">
                  {plant.common_name.join(", ")}
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <Button asChild variant="ghost" size="icon">
                    <Link href={`/plants/species/${plant._id}/view`}>
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link href={`/plants/species/${plant._id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600"
                    onClick={() => {
                      setTargetToDelete(plant._id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {targetToDelete
                ? "Delete this plant?"
                : "Delete selected plants?"}
            </DialogTitle>
          </DialogHeader>
          <div>
            {targetToDelete
              ? "Are you sure you want to delete this plant?"
              : `Are you sure you want to delete ${selectedIds.length} selected plants?`}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setTargetToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (!token) return;

                try {
                  if (targetToDelete) {
                    await deletePlantById(targetToDelete, token);
                    dispatch(
                      setPlantList(
                        plants.filter((p) => p._id !== targetToDelete)
                      )
                    );
                  } else {
                    await Promise.all(
                      selectedIds.map((id) => deletePlantById(id, token))
                    );
                    dispatch(
                      setPlantList(
                        plants.filter((p) => !selectedIds.includes(p._id))
                      )
                    );
                    setSelectedIds([]);
                  }
                } catch (err) {
                  console.error("Delete error:", err);
                }

                setTargetToDelete(null);
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpeciesPage;
