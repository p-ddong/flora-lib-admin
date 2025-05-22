// app/species/[id]/edit/page.tsx
"use client";

import SpecieDetailForm from "@/components/SpeciesDetailForm/SpecieDetailForm";
import { useParams } from "next/navigation";

export default function EditSpeciesPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  if (!id) return <div className="text-red-500">Invalid species ID</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Species</h1>
      <SpecieDetailForm id={id} />
    </div>
  );
}
