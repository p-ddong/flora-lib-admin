"use client";

import { CldImage } from "next-cloudinary";

const extractPublicId = (url: string): string => {
  try {
    const parts = url.split("/upload/")[1];
    return parts.replace(/^v\d+\//, "").replace(/\.[^/.]+$/, "");
  } catch {
    return "";
  }
};

export const PlantImageGallery = ({ images }: { images: string[] }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((src, idx) => (
        <CldImage
          key={idx}
          src={extractPublicId(src)}
          alt={`Image ${idx + 1}`}
          width={400}
          height={300}
          crop="fill"
          gravity="auto"
          className="rounded-md object-cover w-full h-[200px]"
        />
      ))}
    </div>
  );
};
