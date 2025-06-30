"use client";

import type React from "react";

import { CloudImage } from "@/components/Common/CloudImage";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  User,
  Calendar,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  Contribution,
  ContributionStatus,
  PlantDetail,
  SpeciesSection,
} from "@/types";
import { useParams } from "next/navigation";
import {
  fetchContributeDetail,
  moderateContribute,
} from "@/services/contribute.service";
import { getPlantDetailById } from "@/services/plant.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "../ui/textarea";
// Utility functions
const getStatusColor = (status: ContributionStatus) => {
  switch (status) {
    case "approved":
      return "text-green-600 bg-green-50";
    case "rejected":
      return "text-red-600 bg-red-50";
    default:
      return "text-yellow-600 bg-yellow-50";
  }
};

const getStatusIcon = (status: ContributionStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "rejected":
      return <XCircle className="w-4 h-4" />;
    default:
      return <AlertCircle className="w-4 h-4" />;
  }
};

const arraysEqual = (a: string[], b: string[]) => {
  return a.length === b.length && a.every((val, i) => val === b[i]);
};

// Components
const DiffBadge = ({ type }: { type: "added" | "removed" | "modified" }) => {
  const colors = {
    added: "bg-green-100 text-green-800 border-green-200",
    removed: "bg-red-100 text-red-800 border-red-200",
    modified: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <Badge variant="outline" className={`text-xs ${colors[type]}`}>
      {type}
    </Badge>
  );
};

const ComparisonSection = ({
  title,
  original,
  contribution,
  children,
}: {
  title: string;
  original: any;
  contribution: any;
  children: React.ReactNode;
}) => {
  const hasChanges = JSON.stringify(original) !== JSON.stringify(contribution);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="font-semibold text-lg">{title}</h3>
        {hasChanges && <DiffBadge type="modified" />}
      </div>
      {children}
    </div>
  );
};

export default function UpdateComponent() {
  const { id } = useParams();
  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [originalPlant, setOriginalPlant] = useState<PlantDetail | null>(null);
  const [selectedTab, setSelectedTab] = useState("comparison");

  //  moderation state
  const [submitting, setSubmitting] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectMsg, setRejectMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const localToken = localStorage.getItem("token");
      if (!localToken || typeof id !== "string") return;

      try {
        const contributionData = await fetchContributeDetail(id, localToken);
        setContribution(contributionData);
        console.log("contributionData :", contributionData);
        const plantId = contributionData.data.plant_ref;
        const originalData = await getPlantDetailById(plantId, localToken);
        console.log("originalData :", originalData);
        setOriginalPlant(originalData);
      } catch (error) {
        console.error("Failed to fetch contribution or original plant", error);
      }
    };

    fetchData();
  }, [id]);
  const isSectionModified = (
    originalSections: SpeciesSection[],
    sectionToCheck: SpeciesSection
  ) => {
    const matchingOriginal = originalSections.find(
      (s) => s.section === sectionToCheck.section
    );

    if (!matchingOriginal) return true; // section mới

    if (matchingOriginal.details.length !== sectionToCheck.details.length) {
      return true;
    }

    for (let i = 0; i < matchingOriginal.details.length; i++) {
      const origTable = matchingOriginal.details[i];
      const contribTable = sectionToCheck.details[i];

      if (
        origTable.label !== contribTable.label ||
        origTable.content !== contribTable.content
      ) {
        return true;
      }
    }

    return false;
  };
  // ---------- handlers ----------
  const handleApprove = async () => {
    if (!contribution) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await moderateContribute(
        contribution._id,
        { action: "approved", message: "" },
        token
      );
      setContribution(res); // API trả về bản ghi đã cập nhật
    } catch (err) {
      console.error("Approve failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!contribution) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setSubmitting(true);
    try {
      const res = await moderateContribute(
        contribution._id,
        { action: "rejected", message: rejectMsg },
        token
      );
      setContribution(res);
      setRejectOpen(false);
      setRejectMsg("");
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setSubmitting(false);
    }
  };
  if (!contribution || !originalPlant) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading contribution...</p>
        </div>
      </div>
    );
  }

  const contributedPlant = contribution.data.plant;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Contribution Review</h1>
            <p className="text-muted-foreground">
              Compare changes and review contribution
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(contribution.status)}>
              {getStatusIcon(contribution.status)}
              <span className="ml-1 capitalize">{contribution.status}</span>
            </Badge>
          </div>
        </div>

        {/* Contribution Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">By:</span>{" "}
                  {contribution.c_user.username}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {new Date(contribution.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  {contribution.type}
                </span>
              </div>
            </div>
            {contribution.c_message && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Contribution Message:</p>
                    <p className="text-sm text-muted-foreground">
                      {contribution.c_message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="comparison">Side by Side Comparison</TabsTrigger>
          {/* <TabsTrigger value="details">Detailed Changes</TabsTrigger> */}
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Plant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Original Plant</span>
                <Badge variant="outline">Current</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {/* Scientific Name */}
                  <div>
                    <h4 className="font-medium mb-2">Scientific Name</h4>
                    <p className="text-sm italic">
                      {originalPlant.scientific_name}
                    </p>
                  </div>

                  {/* Common Names */}
                  <div>
                    <h4 className="font-medium mb-2">Common Names</h4>
                    <div className="flex flex-wrap gap-1">
                      {originalPlant.common_name.map((name, index) => (
                        <Badge key={index} variant="secondary">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Family */}
                  <div>
                    <h4 className="font-medium mb-2">Family</h4>
                    <p className="text-sm">{originalPlant.family.name}</p>
                  </div>

                  {/* Attributes */}
                  <div>
                    <h4 className="font-medium mb-2">Attributes</h4>
                    <div className="flex flex-wrap gap-1">
                      {originalPlant.attributes.map((attr) => (
                        <Badge key={attr._id} variant="outline">
                          {attr.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  <div>
                    <h4 className="font-medium mb-2">
                      Images ({originalPlant.images.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {originalPlant.images.map((image, index) => (
                        <CloudImage
                          key={index}
                          src={image || "/placeholder.svg"}
                          alt={`Plant image ${index + 1}`}
                          // width={150}
                          // height={150}
                          className="rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Species Description */}
                  <div>
                    <h4 className="font-medium mb-2">Species Description</h4>
                    {originalPlant.species_description.map((section, index) => (
                      <div key={index} className="mb-4">
                        <h5 className="font-medium text-sm mb-2">
                          {section.section}
                        </h5>
                        <div className="space-y-2">
                          {section.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className="text-sm">
                              <span className="font-medium">
                                {detail.label}:
                              </span>{" "}
                              {detail.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Contributed Plant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Proposed Changes</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  Modified
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  {/* Scientific Name */}
                  <div>
                    <h4 className="font-medium mb-2">Scientific Name</h4>
                    <p
                      className={`text-sm italic ${
                        originalPlant.scientific_name !==
                        contributedPlant.scientific_name
                          ? "bg-blue-50 p-2 rounded"
                          : ""
                      }`}
                    >
                      {contributedPlant.scientific_name}
                    </p>
                  </div>

                  {/* Common Names */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Common Names</h4>
                      {!arraysEqual(
                        originalPlant.common_name,
                        contributedPlant.common_name
                      ) && <DiffBadge type="modified" />}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {contributedPlant.common_name.map((name, index) => {
                        const isNew = !originalPlant.common_name.includes(name);
                        return (
                          <Badge
                            key={index}
                            variant="secondary"
                            className={
                              isNew
                                ? "bg-green-100 text-green-800 border-green-200"
                                : ""
                            }
                          >
                            {name}
                            {isNew && <span className="ml-1 text-xs">+</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Family */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Family</h4>
                      {originalPlant.family.name !==
                        contributedPlant.family.name && (
                        <DiffBadge type="modified" />
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        originalPlant.family.name !==
                        contributedPlant.family.name
                          ? "bg-blue-50 p-2 rounded"
                          : ""
                      }`}
                    >
                      {contributedPlant.family.name}
                    </p>
                  </div>

                  {/* Attributes */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Attributes</h4>
                      {!arraysEqual(
                        originalPlant.attributes.map((a) => a.name),
                        contributedPlant.attributes.map((a) => a.name)
                      ) && <DiffBadge type="modified" />}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {contributedPlant.attributes.map((attr, index) => {
                        const isNew = !originalPlant.attributes.some(
                          (a) => a.name === attr.name
                        );
                        return (
                          <Badge
                            key={index}
                            variant="outline"
                            className={
                              isNew
                                ? "bg-green-100 text-green-800 border-green-200"
                                : ""
                            }
                          >
                            {attr.name}
                            {isNew && <span className="ml-1 text-xs">+</span>}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  {contributedPlant.description && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">Description</h4>
                        <DiffBadge type="added" />
                      </div>
                      <p className="text-sm bg-green-50 p-2 rounded">
                        {contributedPlant.description}
                      </p>
                    </div>
                  )}

                  {/* Images */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        New Images ({contribution.data.new_images.length})
                      </h4>
                      {contribution.data.new_images.length > 0 && (
                        <DiffBadge type="added" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {/* {contributedPlant.images.map((image, index) => {
                        const isNew =
                          contribution?.data?.new_images?.includes(image);
                        return (
                          <div key={index} className="relative">
                            <CloudImage
                              src={image || "/placeholder.svg"}
                              alt={`Plant image ${index + 1}`}
                              // width={150}
                              // height={150}
                              className={`rounded-lg object-cover ${
                                isNew ? "ring-2 ring-green-500" : ""
                              }`}
                            />
                          </div>
                        );
                      })} */}
                      {contribution.data.new_images.map((image, index) => {
                        return (
                          <div key={index} className="relative">
                            <CloudImage
                              src={image || "/placeholder.svg"}
                              alt={`Plant image ${index + 1}`}
                              // width={150}
                              // height={150}
                              className={`rounded-lg object-cover ring-2 ring-green-500`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Species Description */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Species Description</h4>
                      {contributedPlant.species_description.some((section) =>
                        isSectionModified(
                          originalPlant.species_description,
                          section
                        )
                      ) && <DiffBadge type="modified" />}
                    </div>

                    {contributedPlant.species_description.map(
                      (section, index) => {
                        const modified = isSectionModified(
                          originalPlant.species_description,
                          section
                        );

                        return (
                          <div key={index} className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <h5 className="font-medium text-sm">
                                {section.section}
                              </h5>
                              {modified && <DiffBadge type="modified" />}
                            </div>
                            <div className="space-y-2">
                              {section.details.map((detail, tableIndex) => (
                                <div
                                  key={tableIndex}
                                  className={`text-sm p-2 rounded ${
                                    modified ? "bg-blue-50" : ""
                                  }`}
                                >
                                  <span className="font-medium">
                                    {detail.label}:
                                  </span>{" "}
                                  {detail.content}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {contribution.status === "pending" && (
          <div className="flex justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="border-red-200 text-red-700 hover:bg-red-50"
              onClick={() => setRejectOpen(true)}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-5 h-5 mr-2" />
              )}
              Reject Contribution
            </Button>

            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={submitting}
            >
              {submitting ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 mr-2" />
              )}
              Approve &amp; Publish
            </Button>
          </div>
        )}

        {contribution.status !== "pending" && (
          <div className="mt-8">
            <Card
              className={`border-2 ${
                contribution.status === "approved"
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3">
                  {contribution.status === "approved" ? (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <span className="text-lg font-semibold text-green-800">
                        This contribution has been approved and published
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span className="text-lg font-semibold text-red-800">
                        This contribution has been rejected
                      </span>
                    </>
                  )}
                </div>
                {contribution.review_message && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Review message:</span>{" "}
                      {contribution.review_message}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Contribution</DialogTitle>
              <DialogDescription>
                Vui lòng ghi rõ lý do từ chối để contributor có thể điều chỉnh.
              </DialogDescription>
            </DialogHeader>

            <Textarea
              value={rejectMsg}
              onChange={(e) => setRejectMsg(e.target.value)}
              placeholder="Enter rejection reason…"
              rows={4}
            />

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() => setRejectOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleReject}
                disabled={submitting || rejectMsg.trim().length === 0}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Change Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ComparisonSection
                  title="Common Names"
                  original={originalPlant.common_name}
                  contribution={contributedPlant.common_name}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Original:</p>
                      <div className="flex flex-wrap gap-1">
                        {originalPlant.common_name.map((name, index) => (
                          <Badge key={index} variant="secondary">
                            {name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Proposed:</p>
                      <div className="flex flex-wrap gap-1">
                        {contributedPlant.common_name.map((name, index) => {
                          const isNew =
                            !originalPlant.common_name.includes(name);
                          return (
                            <Badge
                              key={index}
                              variant="secondary"
                              className={
                                isNew ? "bg-green-100 text-green-800" : ""
                              }
                            >
                              {name} {isNew && "+"}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ComparisonSection>

                <Separator />

                <ComparisonSection
                  title="Attributes"
                  original={originalPlant.attributes.map((a) => a.name)}
                  contribution={contributedPlant.attributes}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Original:</p>
                      <div className="flex flex-wrap gap-1">
                        {originalPlant.attributes.map((attr) => (
                          <Badge key={attr._id} variant="outline">
                            {attr.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">Proposed:</p>
                      <div className="flex flex-wrap gap-1">
                        {contributedPlant.attributes.map((attr, index) => {
                          const isNew = !originalPlant.attributes.some(
                            (a) => a.name === attr.name
                          );
                          return (
                            <Badge
                              key={index}
                              variant="outline"
                              className={
                                isNew ? "bg-green-100 text-green-800" : ""
                              }
                            >
                              {attr.name} {isNew && "+"}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </ComparisonSection>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="font-semibold text-lg">New Description</h3>
                    <DiffBadge type="added" />
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm">{contributedPlant.description}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
