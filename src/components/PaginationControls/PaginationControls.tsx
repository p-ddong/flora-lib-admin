"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const handlePrevious = () => {
    onPageChange(Math.max(1, currentPage - 1));
  };

  const handleNext = () => {
    onPageChange(Math.min(totalPages, currentPage + 1));
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6 justify-center">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handlePrevious} disabled={currentPage === 1}>
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button variant="outline" onClick={handleNext} disabled={currentPage === totalPages}>
          Next
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">Go to page:</span>
        <select
          className="border px-2 py-1 rounded"
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <option key={page} value={page}>
              Page {page}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default PaginationControls;
