"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash, ChevronDown, ChevronRight } from "lucide-react";
import PaginationControls from "@/components/PaginationControls/PaginationControls";
import Link from "next/link";

type SortField = "name" | "count";
type SortOrder = "asc" | "desc";

const FamiliesPage = () => {
  const plants = useSelector((state: RootState) => state.plant.list);

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const grouped = useMemo(() => {
    const map: Record<string, typeof plants> = {};
    plants.forEach((plant) => {
      if (!plant.family_name) return;
      if (!map[plant.family_name]) map[plant.family_name] = [];
      map[plant.family_name].push(plant);
    });
    return map;
  }, [plants]);

  const families = useMemo(() => {
    let entries = Object.entries(grouped);

    if (search.trim()) {
      entries = entries.filter(([name]) =>
        name.toLowerCase().includes(search.toLowerCase())
      );
    }

    entries.sort(([aName, aList], [bName, bList]) => {
      if (sortField === "name") {
        return sortOrder === "asc"
          ? aName.localeCompare(bName)
          : bName.localeCompare(aName);
      } else {
        return sortOrder === "asc"
          ? aList.length - bList.length
          : bList.length - aList.length;
      }
    });

    return entries;
  }, [grouped, search, sortField, sortOrder]);

  const totalPages = Math.ceil(families.length / itemsPerPage);
  const paginatedFamilies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return families.slice(start, start + itemsPerPage);
  }, [families, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, sortField, sortOrder]);

  const toggleExpanded = (family: string) => {
    setExpanded((prev) => ({ ...prev, [family]: !prev[family] }));
  };

  const toggleSelect = (family: string) => {
    setSelectedFamilies((prev) =>
      prev.includes(family)
        ? prev.filter((f) => f !== family)
        : [...prev, family]
    );
  };

  const toggleSelectAll = () => {
    const currentPageFamilies = paginatedFamilies.map(([name]) => name);
    const allSelected = currentPageFamilies.every((name) =>
      selectedFamilies.includes(name)
    );

    if (allSelected) {
      setSelectedFamilies((prev) =>
        prev.filter((name) => !currentPageFamilies.includes(name))
      );
    } else {
      setSelectedFamilies((prev) => [
        ...new Set([...prev, ...currentPageFamilies]),
      ]);
    }
  };

  const handleDelete = () => {
    console.log("Deleting families:", selectedFamilies);
    setSelectedFamilies([]);
    setDeleteDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Families</h1>

      <div className="w-full space-y-2">
        <div className="space-y-1 max-w-sm">
          <Label htmlFor="search">Search by Name</Label>
          <Input
            id="search"
            placeholder="Family name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSortField("name");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            Sort by Name{" "}
            {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSortField("count");
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
            }}
          >
            Sort by Species Count{" "}
            {sortField === "count" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </Button>

          {selectedFamilies.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete selected ({selectedFamilies.length})
            </Button>
          )}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">
              <Checkbox
                checked={paginatedFamilies.every(([name]) =>
                  selectedFamilies.includes(name)
                )}
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead>Family</TableHead>
            <TableHead className="text-right"># Species</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFamilies.map(([family, species]) => (
            <React.Fragment key={family}>
              <TableRow>
                <TableCell>
                  <Checkbox
                    checked={selectedFamilies.includes(family)}
                    onCheckedChange={() => toggleSelect(family)}
                  />
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => toggleExpanded(family)}
                    className="flex items-center gap-2"
                  >
                    {expanded[family] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {family}
                  </button>
                </TableCell>
                <TableCell className="text-right">{species.length}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>

              {expanded[family] &&
                species.map((plant) => (
                  <TableRow key={plant._id} className="bg-muted/50">
                    <TableCell></TableCell>
                    <TableCell colSpan={2}>
                      <div className="pl-6">
                        <div className="font-medium">
                          {plant.scientific_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {plant.common_name.join(", ")}
                        </div>
                      </div>
                    </TableCell>
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
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>

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
            <DialogTitle>Delete selected families?</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete {selectedFamilies.length} families?
            This action cannot be undone.
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamiliesPage;
