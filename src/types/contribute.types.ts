// src/types/contribution.ts

import { PlantDetail } from "./plant.types";

export interface ContributionUser {
  _id: string;
  username: string;
}

export type ContributionStatus = "pending" | "approved" | "rejected";

export type ContributionType = "create" | "update";

export interface Contribution {
  _id: string;
  c_user: ContributionUser;
  c_message?: string;
  type: ContributionType;
  status: ContributionStatus;
  data: {
    plant: PlantDetail;
    new_images: string[];
    plant_ref?:string;
  };
  createdAt: string;
  updatedAt: string;
  reviewed_by?: string;
  review_message?: string;
}
