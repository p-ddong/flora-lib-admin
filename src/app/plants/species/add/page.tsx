import SpecieDetailForm from "@/components/SpeciesDetailForm/SpecieDetailForm";

export default function AddSpeciesPage() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Species</h1>
      <SpecieDetailForm />
    </div>
  );
}
