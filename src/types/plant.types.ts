export interface PlantDetail {
  scientific_name: string;
  common_name: string[];
  family_name: string;
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
  family_name: string;
  image: string;
  common_name: string[];
}
