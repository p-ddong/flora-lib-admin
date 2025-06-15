export interface PlantDetail {
  _id?:string;
  scientific_name: string;
  description?:string;
  common_name: string[];
  family: Family;
  attributes: Attribute[];
  images: string[];
  species_description: SpeciesSection[];
}

export interface PlantDetailPayload {
  _id?:string;
  scientific_name: string;
  common_name: string[];
  description?:string;
  family: string;
  attributes: string[];
  images: string[];
  species_description: SpeciesSection[];
}

export interface SpeciesSection {
  section: string;
  details: SpeciesDetail[];
}

export interface SpeciesDetail {
  label: string;
  content: string;
}

export interface PlantList {
  _id: string;
  scientific_name: string;
  family: string;
  image: string;
  common_name: string[];
  createdAt:string;
  updatedAt:string;
}

export interface Family{
  _id: string;
 name: string;
}

export interface Attribute {
  _id: string;
 name: string;
}