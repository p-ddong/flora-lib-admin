// src/types/contribution.ts

export interface ContributionUser {
  _id: string;
  username: string;
}

export interface SpeciesDescriptionTable {
  title: string;
  content: string;
}

export interface SpeciesDescription {
  title: string;
  tables: SpeciesDescriptionTable[];
}

export interface ContributionPlant {
  scientific_name: string;
  common_name: string[];
  description: string;
  attributes: string[];
  images: string[];
  species_description: SpeciesDescription[];
  family: string;
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
    plant: ContributionPlant;
    newImages: string[];
  };
  createdAt: string;
  updatedAt: string;
  reviewed_by?: string;
  review_message?: string;
}
