"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BASE_API, ENDPOINT_PLANT } from "@/constant/API";
import { PlantImageGallery } from "@/components/PlantImageGallery/PlantImageGallery";
import { PlantDetail } from "@/types";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Pencil, Trash2, ArrowLeft } from "lucide-react";

interface Props {
  id: string;
}

export const PlantDetailClient = ({ id }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingPlant, setLoadingPlant] = useState(true);
  const [plant, setPlant] = useState<PlantDetail | null>(null);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const res = await fetch(`${BASE_API}${ENDPOINT_PLANT.detail}/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setPlant(null);
        } else {
          const data: PlantDetail = await res.json();
          setPlant(data);
        }
      } catch (error) {
        console.error("Failed to fetch plant", error);
        setPlant(null);
      } finally {
        setLoadingPlant(false);
      }
    };

    fetchPlant();
  }, [id]);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      const res = await fetch(`${BASE_API}${ENDPOINT_PLANT.delete}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setOpen(false);
        alert("Plant deleted successfully");
        router.push("/plants");
      } else {
        alert("Failed to delete plant");
      }
    } catch (err) {
      console.error("Delete error", err);
      alert("Error deleting plant");
    } finally {
      setLoadingDelete(false);
    }
  };

  if (loadingPlant) {
    return <div className="p-6">Loading plant details...</div>;
  }

  if (!plant) {
    return <div className="p-6 text-red-500">Plant not found.</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header with Back and Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-blue-600 text-sm hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/plants/species/${id}/edit/`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm inline-flex items-center"
          >
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </button>

          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm inline-flex items-center">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this
                  plant from the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={loadingDelete}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={loadingDelete}>
                  {loadingDelete ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Plant Info */}
      <div>
        <h1 className="text-3xl font-bold">{plant.scientific_name}</h1>
        <p className="text-muted-foreground text-lg">
          {plant.common_name.join(", ")} • {plant.family.name}
        </p>
      </div>

      {/* Images */}
      {plant.images.length > 0 && <PlantImageGallery images={plant.images} />}

      {/* Attributes */}
      {plant.attributes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold">Attributes</h2>
          <ul className="list-disc list-inside text-sm">
            {plant.attributes.map((attr, idx) => (
              <li key={idx}>{attr.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Species Description */}
      {plant.species_description.map((section, idx) => (
        <div key={idx} className="space-y-1">
          <h3 className="text-lg font-bold">{section.section}</h3>
          <ul className="text-sm space-y-0.5">
            {section.details.map((detail, i) => (
              <li key={i}>
                <span className="font-medium">{detail.label}: </span>
                {detail.content}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
