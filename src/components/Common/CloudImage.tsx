// src/components/Common/CloudImage.tsx
"use client"

import { CldImage, CldImageProps } from "next-cloudinary"
import React from "react"

export interface CloudImageProps extends Omit<CldImageProps, "width" | "height"> {
  src: string
  alt: string
  className?: string
}

export const CloudImage: React.FC<CloudImageProps> = ({
  src,
  alt,
  className = "",
  ...restProps
}) => {
  return (
    <div className={`relative w-full aspect-square overflow-hidden ${className}`}>
      <CldImage
        src={src}
        alt={alt}
        fill
        className="object-cover"
        {...restProps}
      />
    </div>
  )
}