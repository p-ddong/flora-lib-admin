"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
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
import {
  createFamily,
  deleteFamilyById,
  deletePlantById,
  fetchFamilyMap,
} from "@/services/family.service";

const FamiliesPage = () => {
  const plants = useSelector((state: RootState) => state.plant.list);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newFamily, setNewFamily] = useState("");
  const [familyIdMap, setFamilyIdMap] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<"name" | "count">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetchFamilyMap(token).then(setFamilyIdMap).catch(console.error);
  }, []);

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

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      for (const family of selectedFamilies) {
        const species = grouped[family] || [];

        for (const plant of species) {
          await deletePlantById(plant._id, token);
        }

        if (species.length === 0 || species.every((p) => !p._id)) {
          const familyId = familyIdMap[family];
          if (familyId) {
            await deleteFamilyById(familyId, token);
          }
        }
      }

      setSelectedFamilies([]);
      setDeleteDialogOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  return (
    <div className="p-6 space-y-6 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold">Families</h1>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by family name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-1/4"
        />
        <p>Total family: {families.length}</p>
      </div>
      <div className="flex gap-3 flex-wrap">
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
          Sort by Count{" "}
          {sortField === "count" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </Button>
        <Button
          className="bg-green-500 text-white"
          onClick={() => setCreating(true)}
        >
          Add new family
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
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    disabled
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
              {expanded[family] &&
                species.map((plant) => (
                  <TableRow key={plant._id} className="bg-muted/50">
                    <TableCell />
                    <TableCell colSpan={2}>
                      <div className="pl-6">
                        <div className="font-medium">
                          {plant.scientific_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {truncateText(plant.common_name.join(", "), 80)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/plants/species/${plant._id}/view`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/plants/species/${plant._id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        disabled
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

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete selected families?</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete {selectedFamilies.length} selected
            families?
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

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Family</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter family name"
            value={newFamily}
            onChange={(e) => setNewFamily(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                const token = localStorage.getItem("token");
                if (!token || !newFamily.trim()) return;
                try {
                  await createFamily(newFamily.trim(), token);
                  setCreating(false);
                  setNewFamily("");
                } catch (err) {
                  console.error("Create family failed:", err);
                }
              }}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamiliesPage;
