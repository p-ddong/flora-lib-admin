// src/components/plant-detail-view.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlantDetail } from "@/types/plant.types";
import { CloudImage } from "@/components/Common/CloudImage";
import { BASE_API, ENDPOINT_PLANT } from "@/constant/API";
import Link from "next/link";

/* —————————————————————————————————————————————————————————— */
interface PlantDetailViewProps {
  id: string;
}

export function PlantDetailView({ id }: PlantDetailViewProps) {
  /* •••─── state ───••• */
  const [plant, setPlant] = useState<PlantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  /* •••─── fetch data ───••• */
  useEffect(() => {
    let ignore = false;
    const fetchPlant = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${BASE_API}${ENDPOINT_PLANT.detail}/${id}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PlantDetail = await res.json();
        if (!ignore) setPlant(data);
      } catch (err) {
        if (!ignore) {
          setError("Không thể lấy dữ liệu cây 🌱");
          console.log(err);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    fetchPlant();
    return () => {
      ignore = true;
    }; // hủy bỏ khi unmount
  }, [id]);

  /* reset slider khi danh sách ảnh thay đổi */
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [plant?.images]);

  /* UI states*/
  if (loading) return <p className="py-10 text-center">Đang tải dữ liệu…</p>;
  if (error)
    return <p className="py-10 text-center text-destructive">{error}</p>;
  if (!plant)
    return <p className="py-10 text-center italic">Không tìm thấy cây.</p>;

  /* an toàn cho mảng ảnh rỗng */
  const images = plant.images?.length
    ? plant.images
    : ["/placeholder.svg?height=600&width=600"];

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  /* gom nhóm section */
  const descriptionSections = (plant.species_description ?? []).filter(
    (s) =>
      !s.section.toLowerCase().includes("care") &&
      !s.section.toLowerCase().includes("variet")
  );
  const careSections = (plant.species_description ?? []).filter((s) =>
    s.section.toLowerCase().includes("care")
  );
  const varietySections = (plant.species_description ?? []).filter((s) =>
    s.section.toLowerCase().includes("variet")
  );

  /* •••─── render ───••• */
  return (
    <div className="p-4 space-y-8">
      {/* ————— Header ————— */}
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-bold italic">{plant.scientific_name}</h1>
          <div className="flex flex-wrap gap-2">
            {plant.common_name.map((name, i) => (
              <span key={i} className="text-xl text-muted-foreground">
                {name}
                {i < plant.common_name.length - 1 && ","}
              </span>
            ))}
          </div>
        </div>
        <div>
          <Button variant="ghost" size="icon">
            <Link href={`/plants/species/${id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="text-red-600">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* ————— Left column ————— */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <Card className="overflow-hidden py-0">
            <div className="relative">
              <CloudImage
                src={images[currentImageIndex]}
                alt={plant.scientific_name}
              />

              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                    <span className="sr-only">Previous image</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                    <span className="sr-only">Next image</span>
                  </Button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex overflow-x-auto p-2 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border",
                      currentImageIndex === idx
                        ? "ring-2 ring-primary"
                        : "opacity-70 hover:opacity-100"
                    )}
                  >
                    <CloudImage
                      src={img}
                      alt={`${plant.scientific_name} thumbnail ${idx + 1}`}
                      className="rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Detail Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <section>
                <h3 className="text-lg font-semibold mb-2">Taxonomy</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <dt className="text-muted-foreground">Family:</dt>
                  <dd className="font-medium">{plant.family.name}</dd>
                  <dt className="text-muted-foreground">Scientific Name:</dt>
                  <dd className="font-medium italic">
                    {plant.scientific_name}
                  </dd>
                </dl>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">Characteristics</h3>
                <div className="flex flex-wrap gap-2">
                  {plant.attributes.map((a, i) => (
                    <Badge key={i} variant="outline" className="bg-primary/10">
                      {a.name}
                    </Badge>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>

        {/* ————— Right column ————— */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="care">Care Guide</TabsTrigger>
              <TabsTrigger value="varieties">Varieties</TabsTrigger>
            </TabsList>

            {/* Description */}
            <TabsContent value="description" className="mt-6">
              {descriptionSections.length ? (
                <PlantAccordion sections={descriptionSections} prefix="desc" />
              ) : (
                <EmptyNote note="No description information available." />
              )}
            </TabsContent>

            {/* Care */}
            <TabsContent value="care" className="mt-6">
              {careSections.length ? (
                <PlantAccordion sections={careSections} prefix="care" />
              ) : (
                <EmptyNote note="No care-guide information available yet." />
              )}
            </TabsContent>

            {/* Varieties */}
            <TabsContent value="varieties" className="mt-6">
              {varietySections.length ? (
                <PlantAccordion sections={varietySections} prefix="variety" />
              ) : (
                <EmptyNote note="Information about varieties will be added soon." />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

/* —————————————————————————————————————————————————————————— */
/* Component phụ trợ: Accordion & Empty Note */
type SectionGroup = PlantDetail["species_description"];

function PlantAccordion({
  sections,
  prefix,
}: {
  sections: SectionGroup;
  prefix: string;
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {sections.map((sec, idx) => (
        <AccordionItem key={idx} value={`${prefix}-${idx}`}>
          <AccordionTrigger className="text-xl font-semibold">
            {sec.section}
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              {sec.details.map((d, i) => (
                <div key={i} className="space-y-2">
                  <h4 className="font-medium text-lg">{d.label}</h4>
                  <p className="text-muted-foreground">{d.content}</p>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function EmptyNote({ note }: { note: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-muted-foreground italic">{note}</p>
    </div>
  );
}
