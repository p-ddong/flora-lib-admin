"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Link from "next/link";

export function PlantFamilyChart() {
  const plants = useSelector((state: RootState) => state.plant.list);

  const data = useMemo(() => {
    const countMap: Record<string, number> = {};
    plants.forEach((plant) => {
      countMap[plant.family] = (countMap[plant.family] || 0) + 1;
    });
    return Object.entries(countMap).map(([family, count]) => ({
      family: family,
      count,
    }));
  }, [plants]);

  if (plants.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Plant Count by Family</CardTitle>
          <CardDescription>
            Displaying number of plants grouped by family
          </CardDescription>
        </div>

        <div className="flex">
          <Link href={"/plants/species"}>
            <div className="cursor-pointer relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
              <span className="text-xs text-muted-foreground">Plant</span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {plants.length}
              </span>
            </div>
          </Link>
          <Link href={"/plants/families"}>
          <div className="cursor-pointer relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6">
            <span className="text-xs text-muted-foreground">Family</span>
            <span className="text-lg font-bold leading-none sm:text-3xl">
              {data.length}
            </span>
          </div>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="px-2 sm:p-6">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[800px] h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 20,
                  left: 0,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="family_name"
                  tick={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide={true} />
                <Tooltip />
                <Bar dataKey="count" name="Count" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
