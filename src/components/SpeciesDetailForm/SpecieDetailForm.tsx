// SpecieDetailForm.tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useForm, useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { ENDPOINT_PLANT, BASE_API } from "@/constant/API";
import { SpeciesSection } from "@/types";
import { Loader2, Plus, Trash2, ChevronsUpDown, Check } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { CldImage } from "next-cloudinary";

interface SpecieDetailFormProps {
  id?: string;
}

type FormValues = {
  scientific_name: string;
  family_name: string;
  common_name: { value: string }[];
  attributes: { value: string }[];
  images: string[];
  species_description: SpeciesSection[];
};

const fixedSections = [
  {
    section: "Plant Care and Propagation",
    details: [
      "Light Preference",
      "Water Preference",
      "Rootzone Tolerance",
      "Propagation Method",
    ],
  },
  {
    section: "Classifications and Characteristics",
    details: ["Plant Growth Form", "Plant Division", "Lifespan (in Singapore)"],
  },
];

export default function SpecieDetailForm({ id }: SpecieDetailFormProps) {
  const [loading, setLoading] = useState(false);
  const [attributesList, setAttributesList] = useState<string[]>([]);
  const [familiesList, setFamiliesList] = useState<string[]>([]);
  const [newCommonName, setNewCommonName] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);

  const { register, control, handleSubmit, reset, setValue, watch } =
    useForm<FormValues>({
      defaultValues: {
        scientific_name: "",
        family_name: "",
        common_name: [],
        attributes: [],
        images: [],
        species_description: [],
      },
    });

  const { fields, append } = useFieldArray({
    control,
    name: "species_description",
  });

  const {
    fields: commonNameFields,
    append: appendCommonName,
    remove: removeCommonName,
  } = useFieldArray({
    control,
    name: "common_name",
  });

  const {
    fields: attributeFields,
    append: appendAttribute,
    remove: removeAttribute,
  } = useFieldArray({
    control,
    name: "attributes",
  });

  useEffect(() => {
    axios.get(`${BASE_API}${ENDPOINT_PLANT.attributes}`).then((res) => {
      setAttributesList(res.data.map((item: any) => item.name));
    });
    axios.get(`${BASE_API}${ENDPOINT_PLANT.families}`).then((res) => {
      const families = res.data.map((item: any) => item.name);
      setFamiliesList(families);
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`${BASE_API}${ENDPOINT_PLANT.detail}/${id}`)
        .then((res) => {
          reset(res.data);
          setSelectedFamily(res.data.family_name);
        })
        .finally(() => setLoading(false));
    } else {
      const fixedInit = fixedSections.map((s) => ({
        section: s.section,
        details: s.details.map((d) => ({ label: d, content: "" })),
      }));
      reset({
        scientific_name: "",
        family_name: "",
        common_name: [],
        attributes: [],
        images: [],
        species_description: fixedInit,
      });
    }
  }, [id, reset]);

  useEffect(() => {
    setValue("family_name", selectedFamily ?? "");
  }, [selectedFamily, setValue]);

  useEffect(() => {
    axios.get(`${BASE_API}${ENDPOINT_PLANT.attributes}`).then((res) => {
      setAttributesList(res.data.map((item: any) => item.name));
    });
    axios.get(`${BASE_API}${ENDPOINT_PLANT.families}`).then((res) => {
      setFamiliesList(res.data.map((item: any) => item.name));
    });
  }, []);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios
        .get(`${BASE_API}${ENDPOINT_PLANT.detail}/${id}`)
        .then((res) => {
          const data = res.data;

          const transformed = {
            ...data,
            common_name: (data.common_name || []).map((name: string) => ({
              value: name,
            })),
            attributes: (data.attributes || []).map((attr: string) => ({
              value: attr,
            })),
          };

          reset(transformed);
          setSelectedFamily(data.family_name);
        })
        .finally(() => setLoading(false));
    } else {
      const fixedInit = fixedSections.map((s) => ({
        section: s.section,
        details: s.details.map((d) => ({ label: d, content: "" })),
      }));
      reset({
        scientific_name: "",
        family_name: "",
        common_name: [],
        attributes: [],
        images: [],
        species_description: fixedInit,
      });
    }
  }, [id, reset]);

  useEffect(() => {
    const familyWatch = watch("family_name");
    if (!selectedFamily && familyWatch) {
      setSelectedFamily(familyWatch);
    } else if (familyWatch !== selectedFamily) {
      setSelectedFamily(familyWatch);
    }
  }, [watch, selectedFamily]);

  const onSubmit = async (data: FormValues) => {
    const validDescriptions = data.species_description.filter((section) => {
      const fixed = fixedSections.find((f) => f.section === section.section);
      if (fixed) {
        return fixed.details.every((d) =>
          section.details.some((x) => x.label === d && x.content.trim())
        );
      }
      return true;
    });

    if (validDescriptions.length !== data.species_description.length) {
      alert("Please fill all required fields in fixed sections.");
      return;
    }

    try {
      const url = id
        ? `${BASE_API}${ENDPOINT_PLANT.update}/${id}`
        : `${BASE_API}${ENDPOINT_PLANT.create}`;
      const method = id ? axios.put : axios.post;
      await method(url, { ...data, species_description: validDescriptions });
      alert("Saved successfully");
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  };

  const handleAddSection = () => {
    append({ section: "", details: [{ label: "", content: "" }] });
  };

  const handleAddDetail = (sectionIndex: number) => {
    const current = watch(`species_description.${sectionIndex}.details`) || [];
    setValue(`species_description.${sectionIndex}.details`, [
      ...current,
      { label: "", content: "" },
    ]);
  };

  const handleRemoveDetail = (sectionIndex: number, detailIndex: number) => {
    const current = watch(`species_description.${sectionIndex}.details`);
    const updated = current.filter((_: any, i: number) => i !== detailIndex);
    setValue(`species_description.${sectionIndex}.details`, updated);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {loading && <Loader2 className="animate-spin" />}

      <Input
        {...register("scientific_name", { required: true })}
        placeholder="Scientific Name *"
        disabled={id ? true : false}
      />
      {/* Images Preview */}
      <div className="mt-4">
        <label className="font-medium">Images</label>
        <div className="flex flex-wrap gap-4 mt-2">
          {watch("images").map((url, index) => (
            <div
              key={index}
              className="relative w-32 h-32 border rounded-md overflow-hidden"
            >
              <CldImage
                src={url}
                alt={`Image ${index}`}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 p-0"
                onClick={() => {
                  const updated = watch("images").filter((_, i) => i !== index);
                  setValue("images", updated);
                }}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>

        {/* Add Image from Local */}
        <div className="mt-4">
          <input
            type="file"
            accept="image/*"
            // onChange={async (e) => {
            //   const file = e.target.files?.[0];
            //   if (!file) return;

            //   const formData = new FormData();
            //   formData.append("file", file);
            //   formData.append("upload_preset", "YOUR_UPLOAD_PRESET");

            //   try {
            //     const res = await fetch(
            //       "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
            //       {
            //         method: "POST",
            //         body: formData,
            //       }
            //     );
            //     const data = await res.json();
            //     const url = data.public_id; // 👈 Nếu bạn dùng CldImage thì cần public_id, không phải full URL
            //     setValue("images", [...watch("images"), url]);
            //   } catch (err) {
            //     console.error("Upload failed", err);
            //     alert("Image upload failed");
            //   }

            //   e.target.value = ""; // clear input
            // }}
          />
        </div>
      </div>

      <div className="mt-4 space-x-2  ">
        <label className="font-medium">Family Name *</label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="min-w-[200px] justify-between"
            >
              {selectedFamily || "Filter by Family"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search family..." />
              <CommandEmpty>No family found.</CommandEmpty>
              <CommandGroup>
                {familiesList.map((family) => (
                  <CommandItem
                    key={family}
                    onSelect={() => {
                      setSelectedFamily(family);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        family === selectedFamily ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {family}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Common Names */}
      <div>
        <label className="font-medium">Common Names</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {commonNameFields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-center gap-1 border px-2 py-1 rounded-full bg-muted"
            >
              <span>{watch(`common_name.${index}.value`)}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => removeCommonName(index)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <Input
            value={newCommonName}
            onChange={(e) => setNewCommonName(e.target.value)}
            placeholder="New common name"
          />
          <Button
            type="button"
            onClick={() => {
              if (newCommonName.trim()) {
                appendCommonName({ value: newCommonName.trim() });
                setNewCommonName("");
              }
            }}
          >
            Add Common Name
          </Button>
        </div>
      </div>

      {/* Attributes */}
      <div className="mt-4">
        <label className="font-medium">Attributes</label>
        {attributeFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 mt-1">
            <Select
              onValueChange={(value) =>
                setValue(`attributes.${index}.value`, value)
              }
              defaultValue={watch(`attributes.${index}.value`)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select attribute" />
              </SelectTrigger>
              <SelectContent>
                {attributesList.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeAttribute(index)}
            >
              ✕
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          className="mt-2"
          onClick={() => appendAttribute({ value: "" })}
        >
          Add Attribute
        </Button>
      </div>

      {/* Sections */}
      <Accordion type="multiple">
        {fields.map((field, sectionIndex) => {
          const currentSection =
            watch(`species_description.${sectionIndex}.section`) ??
            field.section;
          const isFixed = fixedSections.some(
            (f) => f.section === currentSection
          );
          const fixedDetailLabels =
            fixedSections.find((f) => f.section === currentSection)?.details ??
            [];
          const details =
            watch(`species_description.${sectionIndex}.details`) || [];

          return (
            <AccordionItem key={field.id} value={`section-${sectionIndex}`}>
              <AccordionTrigger>
                <span className={isFixed ? "text-red-500 font-semibold" : ""}>
                  {isFixed
                    ? `${currentSection} *`
                    : currentSection || "New Section"}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {!isFixed && (
                  <Input
                    placeholder="Section Name"
                    {...register(`species_description.${sectionIndex}.section`)}
                    className="mb-2 font-bold text-emerald-600"
                  />
                )}

                {details.map((_, detailIndex) => {
                  const labelPath =
                    `species_description.${sectionIndex}.details.${detailIndex}.label` as const;
                  const contentPath =
                    `species_description.${sectionIndex}.details.${detailIndex}.content` as const;
                  const currentLabel = watch(labelPath);
                  const isPredefined =
                    isFixed && fixedDetailLabels.includes(currentLabel);

                  return (
                    <div className="mb-4 space-y-1" key={detailIndex}>
                      {isPredefined ? (
                        <Input
                          disabled
                          className="bg-muted font-semibold"
                          {...register(labelPath)}
                        />
                      ) : (
                        <Input placeholder="Label" {...register(labelPath)} className="font-semibold"/>
                      )}
                      <Textarea
                        placeholder="Content"
                        {...register(contentPath)}
                      />

                      {!isPredefined && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRemoveDetail(sectionIndex, detailIndex)
                          }
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove Detail
                        </Button>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddDetail(sectionIndex)}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Detail
                </Button>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      <Button type="button" onClick={handleAddSection} variant="outline">
        <Plus className="w-4 h-4 mr-1" /> Add Section
      </Button>

      <div className="flex justify-end gap-2">
        <Button type="submit">{id ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}
