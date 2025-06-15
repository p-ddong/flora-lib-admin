// ContributionComparison.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Contribution, PlantDetail } from "@/types";
import { fetchContributeDetail } from "@/services/contribute.service";
import { getPlantDetailById } from "@/services/plant.service";
import UpdateComponent from "./UpdateComponent";
import CreateContributionView from "./CreateComponent";

export default function ContributionComparison() {
  const { id } = useParams();
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [originalPlant, setOriginalPlant] = useState<PlantDetail | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const localToken = localStorage.getItem("token");
      if (!localToken || typeof id !== "string") return;

      try {
        const contributionData = await fetchContributeDetail(id, localToken);
        setContribution(contributionData);

        if (contributionData.type === "update") {
          const plantId = contributionData.data.plant_ref;
          const originalData = await getPlantDetailById(plantId, localToken);
          setOriginalPlant(originalData);
        }
      } catch (error) {
        console.error("Failed to fetch contribution or original plant", error);
      }
    };

    fetchData();
  }, [id]);

  if (!contribution || (contribution.type === "update" && !originalPlant)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return contribution.type === "create" ? (
    <CreateContributionView />
  ) : (
    <UpdateComponent/>
  );
}
