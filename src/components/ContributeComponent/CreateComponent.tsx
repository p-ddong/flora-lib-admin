"use client"

import { CloudImage } from "@/components/Common/CloudImage"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CheckCircle, XCircle, AlertCircle, Eye, User, Calendar, MessageSquare, Plus, Loader2 } from "lucide-react"
import type { Contribution, ContributionStatus } from "@/types"
import { useParams } from "next/navigation"
import { fetchContributeDetail,moderateContribute } from "@/services/contribute.service"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "../ui/textarea"
// Utility functions
const getStatusColor = (status: ContributionStatus) => {
  switch (status) {
    case "approved":
      return "text-green-600 bg-green-50"
    case "rejected":
      return "text-red-600 bg-red-50"
    default:
      return "text-yellow-600 bg-yellow-50"
  }
}

const getStatusIcon = (status: ContributionStatus) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4" />
    case "rejected":
      return <XCircle className="w-4 h-4" />
    default:
      return <AlertCircle className="w-4 h-4" />
  }
}

const NewBadge = () => (
  <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
    <Plus className="w-3 h-3 mr-1" />
    New
  </Badge>
)

export default function CreateContributionView() {
 const { id } = useParams()
  const [contribution, setContribution] = useState<Contribution | null>(null)
  const [loading, setLoading] = useState(true)

  //  moderation state
  const [submitting, setSubmitting] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectMsg, setRejectMsg] = useState("")

  // ---------- fetch ----------
  useEffect(() => {
    const fetchData = async () => {
      const localToken = localStorage.getItem("token")
      if (!localToken || typeof id !== "string") return

      try {
        const data = await fetchContributeDetail(id, localToken)
        setContribution(data)
      } catch (err) {
        console.error("Failed to fetch contribution", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // ---------- handlers ----------
  const handleApprove = async () => {
    if (!contribution) return
    const token = localStorage.getItem("token")
    if (!token) return
    setSubmitting(true)
    try {
      const res = await moderateContribute(
        contribution._id,
        { action: "approved", message: "" },
        token,
      )
      setContribution(res) // API trả về bản ghi đã cập nhật
    } catch (err) {
      console.error("Approve failed", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!contribution) return
    const token = localStorage.getItem("token")
    if (!token) return
    setSubmitting(true)
    try {
      const res = await moderateContribute(
        contribution._id,
        { action: "rejected", message: rejectMsg },
        token,
      )
      setContribution(res)
      setRejectOpen(false)
      setRejectMsg("")
    } catch (err) {
      console.error("Reject failed", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">Loading contribution...</p>
        </div>
      </div>
    )
  }

  if (!contribution) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Contribution not found</p>
        </div>
      </div>
    )
  }

  // Redirect if not a create contribution
  if (contribution.type !== "create") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-muted-foreground">This is not a create contribution</p>
          <p className="text-sm text-muted-foreground mt-2">Please use the comparison view for update contributions</p>
        </div>
      </div>
    )
  }

  const contributedPlant = contribution.data.plant

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Plus className="w-8 h-8 text-green-600" />
              New Plant Contribution
            </h1>
            <p className="text-muted-foreground">Review and approve new plant submission</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(contribution.status)}>
              {getStatusIcon(contribution.status)}
              <span className="ml-1 capitalize">{contribution.status}</span>
            </Badge>
          </div>
        </div>

        {/* Contribution Info */}
        <Card className=" bg-green-50/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Contributor:</span>{" "}
                  <span className="font-medium text-green-700">{contribution.c_user.username}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  <span className="font-medium">{new Date(contribution.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  <span className="text-muted-foreground">Type:</span>{" "}
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    {contribution.type}
                  </Badge>
                </span>
              </div>
            </div>
            {contribution.c_message && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Contribution Message:</p>
                    <p className="text-sm text-gray-700 mt-1">{contribution.c_message}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Plant Information */}
      <Card className="">
        <CardHeader className="bg-green-50/50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <span>Plant Information</span>
            <NewBadge />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ScrollArea className="h-[700px] pr-4">
            <div className="space-y-8">
              {/* Scientific Name */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Scientific Name</h3>
                  <NewBadge />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-lg italic font-medium text-green-800">{contributedPlant.scientific_name}</p>
                </div>
              </div>

              {/* Common Names */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Common Names</h3>
                  <NewBadge />
                </div>
                <div className="flex flex-wrap gap-2">
                  {contributedPlant.common_name.map((name, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-100 text-green-800 border-green-300 px-3 py-1 text-sm"
                    >
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Family */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Family</h3>
                  <NewBadge />
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-base font-medium text-green-800">{contributedPlant.family.name}</p>
                </div>
              </div>

              {/* Attributes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Attributes</h3>
                  <NewBadge />
                </div>
                <div className="flex flex-wrap gap-2">
                  {contributedPlant.attributes.map((attr, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-300 px-3 py-1 text-sm"
                    >
                      {attr.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              {contributedPlant.description && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <NewBadge />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-base text-gray-700 leading-relaxed">{contributedPlant.description}</p>
                  </div>
                </div>
              )}

              {/* Images */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Images ({contribution.data.new_images.length})</h3>
                  <NewBadge />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contribution.data.new_images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="relative overflow-hidden rounded-lg border-2 border-green-200 hover:border-green-400 transition-colors">
                        <CloudImage
                          src={image || "/placeholder.svg"}
                          alt={`${contributedPlant.scientific_name} - Image ${index + 1}`}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-600 text-white text-xs shadow-lg">New</Badge>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                          <p className="text-white text-xs font-medium">Image {index + 1}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Species Description */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">Species Description</h3>
                  <NewBadge />
                </div>
                <div className="space-y-4">
                  {contributedPlant.species_description.map((section, index) => (
                    <div key={index} className="border border-green-200 rounded-lg overflow-hidden">
                      <div className="bg-green-50 px-4 py-3 border-b border-green-200">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-green-800">{section.section}</h4>
                          <Badge className="bg-green-100 text-green-700 text-xs">New Section</Badge>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        {section.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="bg-green-50/50 rounded-md p-3">
                            <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                              <span className="font-medium text-green-800 min-w-0 sm:min-w-[120px]">
                                {detail.label}:
                              </span>
                              <span className="text-gray-700 flex-1">{detail.content}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

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


      {/* Status Message */}
      {contribution.status !== "pending" && (
        <div className="mt-8">
          <Card
            className={`border-2 ${
              contribution.status === "approved" ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
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
                    <span className="text-lg font-semibold text-red-800">This contribution has been rejected</span>
                  </>
                )}
              </div>
              {contribution.review_message && (
                <div className="mt-4 p-3 bg-white rounded border">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Review message:</span> {contribution.review_message}
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
    </div>
  )
}
