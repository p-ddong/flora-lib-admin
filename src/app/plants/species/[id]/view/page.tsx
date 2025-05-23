// src/app/plants/species/[id]/page.tsx
"use client";
import { PlantDetailView } from "@/components/PlantDetail/PlantDetail";
// import { PlantDetailClient } from "@/components/PlantDetailClient/PlantDetailClient";
import { useParams } from "next/navigation";


export default function PlantDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) return <div className="text-red-500">Invalid species ID</div>;

  return <PlantDetailView id={id} />;
}
