import React, { useEffect, useState, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Plus,
  Ruler,
  Trash2,
  Search,
  SquarePen,
  Calendar,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";

import {
  addSizeChart,
  deleteSizeChart,
  getAllSizeCharts,
  toogleAddModal,
  updateSizeChart,
  type SIZE_CHART,
} from "@/store/sizeChartSlice";

import { warningHandler } from "@/shared/_helper/responseHelper";
import { getAllSize } from "@/store/sizeSlice";

export default function SizeCharts() {
  const sizeChartsVar = useSelector((state: RootState) => state.sizeChart);
  const sizeVar = useSelector((state: RootState) => state.size);

  const dispatch = useDispatch<AppDispatch>();

  // Modal State
  const [editingSizeChart, setEditingSizeChart] = useState<SIZE_CHART | null>(
    null,
  );

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rows: [
      {
        size: "",
        height: {
          min: "",
          max: "",
        },
        chest: {
          min: "",
          max: "",
        },
        waist: {
          min: "",
          max: "",
        },
      },
    ],
  });

  const [formVar, setFormVar] = useState({
    keyword: "",
    limit: 10,
    offset: 0,
  })

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingSizeChart(null);

    setFormData({
      name: "",
      description: "",
      rows: [
        {
          size: "",
          height: {
            min: "",
            max: "",
          },
          chest: {
            min: "",
            max: "",
          },
          waist: {
            min: "",
            max: "",
          },
        },
      ],
    });

    dispatch(toogleAddModal(true));
  };

  // Open Modal for Edit
  const handleOpenEditModal = (sizeChart: SIZE_CHART) => {
    setEditingSizeChart(sizeChart);

    setFormData({
      name: sizeChart.name,
      description: sizeChart.description || "",
      rows: sizeChart.rows.map((row) => ({
        size: typeof row.size === "object" ? row.size._id : row.size,

        height: {
          min: row.height?.min?.toString() || "",
          max: row.height?.max?.toString() || "",
        },

        chest: {
          min: row.chest?.min?.toString() || "",
          max: row.chest?.max?.toString() || "",
        },

        waist: {
          min: row.waist?.min?.toString() || "",
          max: row.waist?.max?.toString() || "",
        },
      })),
    });

    dispatch(toogleAddModal(true));
  };

  // Handle input change
  const handleInputChange = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle row input change
  const handleRowInputChange = (
    rowIndex: number,
    field: "size" | "height" | "chest" | "waist",
    value: string,
    rangeField?: "min" | "max",
  ) => {
    setFormData((prev) => {
      const rows = [...prev.rows];

      if (field === "size") {
        rows[rowIndex] = {
          ...rows[rowIndex],
          size: value,
        };
      } else {
        rows[rowIndex] = {
          ...rows[rowIndex],
          [field]: {
            ...rows[rowIndex][field],
            [rangeField!]: value,
          },
        };
      }

      return {
        ...prev,
        rows,
      };
    });
  };

  // Add new row
  const handleAddRow = () => {
    setFormData((prev) => ({
      ...prev,
      rows: [
        ...prev.rows,
        {
          size: "",
          height: {
            min: "",
            max: "",
          },
          chest: {
            min: "",
            max: "",
          },
          waist: {
            min: "",
            max: "",
          },
        },
      ],
    }));
  };

  // Remove row
  const handleRemoveRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rows: prev.rows.filter((_, rowIndex) => rowIndex !== index),
    }));
  };

  // Save (Create / Edit)
  const handleSaveSizeChart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      warningHandler("Please enter a size chart name.");
      return;
    }

    if (formData.rows.length === 0) {
      warningHandler("Please add at least one size.");
      return;
    }

    // Validate rows
    for (let index = 0; index < formData.rows.length; index++) {
      const row = formData.rows[index];

      if (!row.size) {
        warningHandler(`Please select a size for row ${index + 1}.`);
        return;
      }

      const measurements = [
        {
          name: "Height",
          value: row.height,
        },
        {
          name: "Chest",
          value: row.chest,
        },
        {
          name: "Waist",
          value: row.waist,
        },
      ];

      for (const measurement of measurements) {
        const min = parseFloat(measurement.value.min);
        const max = parseFloat(measurement.value.max);

        if (isNaN(min) || min < 0) {
          warningHandler(`${measurement.name} minimum must be a valid number.`);
          return;
        }

        if (isNaN(max) || max < 0) {
          warningHandler(`${measurement.name} maximum must be a valid number.`);
          return;
        }

        if (max < min) {
          warningHandler(
            `${measurement.name} maximum cannot be lower than minimum.`,
          );
          return;
        }
      }
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),

      rows: formData.rows.map((row) => ({
        size: row.size,

        height: {
          min: parseFloat(row.height.min),
          max: parseFloat(row.height.max),
        },

        chest: {
          min: parseFloat(row.chest.min),
          max: parseFloat(row.chest.max),
        },

        waist: {
          min: parseFloat(row.waist.min),
          max: parseFloat(row.waist.max),
        },
      })),
    };

    if (editingSizeChart) {
      // Update
      await dispatch(updateSizeChart(editingSizeChart._id, payload)).finally(
        () => {
          setEditingSizeChart(null);
        },
      );
    } else {
      // Add
      await dispatch(addSizeChart(payload));
    }
  };

  const [hasMore, setHasMore] = useState(true);
  const [viewingSizeChart, setViewingSizeChart] = useState<SIZE_CHART | null>(
    null,
  );
  const [displayUnit, setDisplayUnit] = useState<"cm" | "in">("cm");
  const searchTimeoutRef = useRef(null);

  const getSizeObj = (sizeField: any) => {
    if (typeof sizeField === "object" && sizeField !== null) {
      return sizeField;
    }
    return sizeVar.sizes.find((s) => s._id === sizeField);
  };

  const getSizeName = (sizeField: any) => {
    if (typeof sizeField === "object" && sizeField?.name) {
      return sizeField.name;
    }
    const found = sizeVar.sizes.find((s) => s._id === sizeField);
    return found ? found.name : typeof sizeField === "string" ? sizeField : "—";
  };

  const formatApproxAge = (sizeField: any) => {
    const sizeObj = getSizeObj(sizeField);
    if (
      !sizeObj ||
      (sizeObj.minAge === undefined && sizeObj.maxAge === undefined)
    ) {
      return "—";
    }
    const { minAge, maxAge, ageUnit = "year" } = sizeObj;
    const unitLabel = ageUnit === "month" ? "Month" : "Year";

    if (minAge !== undefined && maxAge !== undefined) {
      if (minAge === maxAge) {
        return `${minAge} ${unitLabel}${minAge > 1 ? "s" : ""}`;
      }
      return `${minAge} - ${maxAge} ${unitLabel}s`;
    }
    if (minAge !== undefined) {
      return `${minAge}+ ${unitLabel}s`;
    }
    if (maxAge !== undefined) {
      return `Up to ${maxAge} ${unitLabel}s`;
    }
    return "—";
  };

  const formatMeasurement = (
    val?: { min?: number; max?: number },
    unit: "cm" | "in" = "in",
  ) => {
    if (!val || (val.min === undefined && val.max === undefined)) return "—";
    const minVal = Number(val.min ?? 0);
    const maxVal = Number(val.max ?? minVal);

    if (unit === "in") {
      const minIn = (minVal / 2.54).toFixed(1);
      const maxIn = (maxVal / 2.54).toFixed(1);
      return `${minIn} - ${maxIn} in`;
    }

    return `${minVal.toFixed(1)} - ${maxVal.toFixed(1)} cm`;
  };

  const handleDelete = (id?: string) => {
    if (id) {
      dispatch(deleteSizeChart(id));
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFormVar((prev) => ({
      ...prev,
      keyword: searchTerm,
      offset: 0,
    }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      dispatch(getAllSizeCharts(searchTerm, formVar.limit, 0));
    }, 500);
  };

  const fetchMoreSizeCharts = async () => {
    if (
      sizeChartsVar.status === "loading" ||
      sizeChartsVar.sizeCharts.length >= sizeChartsVar.total
    ) {
      return;
    }

    const newOffset = formVar.offset + formVar.limit;
    await dispatch(
      getAllSizeCharts(formVar.keyword, formVar.limit, newOffset),
    );

    setFormVar((prev) => ({
      ...prev,
      offset: newOffset,
    }));
  };

  useEffect(() => {
    if (
      sizeChartsVar.sizeCharts.length >= sizeChartsVar.total &&
      sizeChartsVar.total > 0
    ) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }
  }, [sizeChartsVar.sizeCharts.length, sizeChartsVar.total]);

  useEffect(() => {
    dispatch(getAllSizeCharts(formVar.keyword, formVar.limit, formVar.offset));
    dispatch(getAllSize("", 0, 0, ""));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Ruler className="h-5 w-5 text-primary" />

            <h1 className="text-xl font-bold tracking-tight">Size Charts</h1>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage size charts and measurement guides for your products.
          </p>
        </div>

        <Button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Size Chart
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-xs">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search size charts by name or description..."
            value={formVar.keyword}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10 bg-background text-xs placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Main Size Charts Card / Table */}
      <Card className="rounded-2xl border-border overflow-hidden shadow-xs">
        <CardContent className="p-0">
          {sizeChartsVar.sizeCharts.length === 0 &&
          sizeChartsVar.status !== "loading" ? (
            <div className="p-12 text-center space-y-3">
              <div className="p-3.5 rounded-full bg-muted text-muted-foreground w-fit mx-auto">
                <Ruler className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-foreground">
                No size charts found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {formVar.keyword
                  ? "Try adjusting your search criteria."
                  : "Get started by creating your first product size chart."}
              </p>
              {!formVar.keyword && (
                <Button
                  onClick={handleOpenAddModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl px-4 py-2 mt-2 inline-flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Size Chart
                </Button>
              )}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={sizeChartsVar.sizeCharts.length}
              next={fetchMoreSizeCharts}
              hasMore={hasMore}
              loader={
                <div className="py-6 text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading more size charts...
                </div>
              }
              endMessage={
                sizeChartsVar.sizeCharts.length > 0 && (
                  <div className="py-6 text-center text-xs text-muted-foreground font-medium border-t border-border/50">
                    Showing all {sizeChartsVar.sizeCharts.length} of{" "}
                    {sizeChartsVar.total} size charts
                  </div>
                )
              }
            >
              {/* Mobile Card View (< xl screens) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 xl:hidden">
                {sizeChartsVar.sizeCharts.map((chart, cIdx) => {
                  const chartId = chart._id || `chart-${cIdx}`;

                  return (
                    <div
                      key={chartId}
                      className="p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-all shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                            <Ruler className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {chart.name}
                            </p>
                            {chart.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {chart.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Sizes Badges */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-muted-foreground">
                          Configured Sizes ({chart.rows?.length || 0}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {chart.rows && chart.rows.length > 0 ? (
                            chart.rows.map((r, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-foreground border border-border/60"
                              >
                                {getSizeName(r.size)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground italic">
                              No sizes
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />{" "}
                          {chart.createdAt
                            ? new Date(chart.createdAt).toLocaleDateString()
                            : "—"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setViewingSizeChart(chart);
                              setDisplayUnit("in");
                            }}
                            className="h-8 w-8 text-indigo-600 border-border hover:bg-indigo-50 cursor-pointer"
                            title="View Size Guide"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleOpenEditModal(chart)}
                            className="h-8 w-8 text-amber-500 border-border hover:bg-amber-500/10 cursor-pointer"
                            title="Edit"
                          >
                            <SquarePen className="h-3.5 w-3.5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Size Chart?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{chart.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(chart._id)}
                                >
                                  Yes, delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (xl+ screens) */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="py-3.5 px-5">Chart Name</th>
                      <th className="py-3.5 px-4">Configured Sizes</th>
                      <th className="py-3.5 px-4">Created Date</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {sizeChartsVar.sizeCharts.map((chart, cIdx) => {
                      const chartId = chart._id || `chart-${cIdx}`;

                      return (
                        <tr
                          key={chartId}
                          className="hover:bg-muted/30 transition-colors group"
                        >
                          {/* Chart Name & Description */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
                                <Ruler className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-foreground">
                                  {chart.name}
                                </p>
                                {chart.description && (
                                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                                    {chart.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Configured Sizes */}
                          <td className="py-4 px-4">
                            <div className="flex flex-wrap gap-1.5 max-w-md">
                              {chart.rows && chart.rows.length > 0 ? (
                                chart.rows.map((row, rIdx) => (
                                  <span
                                    key={rIdx}
                                    className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-foreground border border-border/60"
                                  >
                                    {getSizeName(row.size)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-muted-foreground italic">
                                  No sizes
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Created Date */}
                          <td className="py-4 px-4 text-muted-foreground font-mono text-[11px]">
                            {chart.createdAt
                              ? new Date(chart.createdAt).toLocaleDateString()
                              : "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setViewingSizeChart(chart);
                                  setDisplayUnit("in");
                                }}
                                title="View Size Guide"
                                className="h-8 w-8 text-indigo-600 border-border hover:bg-indigo-50 cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleOpenEditModal(chart)}
                                title="Edit"
                                className="h-8 w-8 text-amber-500 border-border hover:bg-amber-500/10 cursor-pointer"
                              >
                                <SquarePen className="h-3.5 w-3.5" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Size Chart?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete &quot;{chart.name}&quot;? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-red-600 hover:bg-red-700"
                                      onClick={() => handleDelete(chart._id)}
                                    >
                                      Yes, delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </InfiniteScroll>
          )}
        </CardContent>
      </Card>

      {/* View Size Guide & Measurements Modal (Styled like the design) */}
      <Dialog
        open={!!viewingSizeChart}
        onOpenChange={(open) => !open && setViewingSizeChart(null)}
      >
        <DialogContent className="max-w-2xl sm:max-w-3xl p-6 sm:p-8 rounded-3xl bg-white border border-border/80 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-[#5845D8] shrink-0">
                <Ruler className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                Size Guide &amp; Measurements
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs sm:text-sm text-slate-500 font-medium pl-11">
              {viewingSizeChart?.description ||
                viewingSizeChart?.name ||
                "Size collection guide"}
            </DialogDescription>
          </div>

          <div className="mt-6 space-y-4">
            {/* Display Units Switcher */}
            <div className="flex items-center justify-between px-5 py-2.5 rounded-full border border-slate-200 bg-white shadow-2xs">
              <span className="text-xs sm:text-sm font-bold text-slate-900">
                Display Units:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDisplayUnit("cm")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    displayUnit === "cm"
                      ? "bg-[#5845D8] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Centimeters (cm)
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayUnit("in")}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    displayUnit === "in"
                      ? "bg-[#5845D8] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Inches (in)
                </button>
              </div>
            </div>

            {/* Measurements Table */}
            <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-900 text-xs font-bold border-b border-slate-200">
                      <th className="py-3.5 px-5">Size</th>
                      <th className="py-3.5 px-5">Age</th>
                      <th className="py-3.5 px-5">Height</th>
                      <th className="py-3.5 px-5">Chest</th>
                      <th className="py-3.5 px-5">Waist</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {viewingSizeChart?.rows &&
                    viewingSizeChart.rows.length > 0 ? (
                      viewingSizeChart.rows.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-amber-50/30 transition-colors"
                        >
                          <td className="py-3.5 px-5 font-bold text-[#5845D8]">
                            {getSizeName(row.size)}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-700">
                            {formatApproxAge(row.size)}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-600">
                            {formatMeasurement(row.height, displayUnit)}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-600">
                            {formatMeasurement(row.chest, displayUnit)}
                          </td>
                          <td className="py-3.5 px-5 font-medium text-slate-600">
                            {formatMeasurement(row.waist, displayUnit)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-xs text-muted-foreground italic"
                        >
                          No measurements configured for this chart.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Modal */}
      <Dialog
        open={sizeChartsVar.isAddModalOpen}
        onOpenChange={(open) => dispatch(toogleAddModal(open))}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSizeChart ? "Edit Size Chart" : "Add Size Chart"}
            </DialogTitle>

            <DialogDescription>
              {editingSizeChart
                ? "Update the size chart and its measurements."
                : "Create a size chart with size measurements."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSizeChart} className="space-y-6">
            {/* Basic Information */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardContent className="p-5 md:p-6 space-y-5">
                <div>
                  <label className="text-sm font-medium">Chart Name</label>

                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g. Kids & Youth Size Guide"
                    className="mt-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>

                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="e.g. Kids & Youth Collection (2–9Y)"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Size Rows */}
            <Card className="rounded-2xl border-border shadow-xs">
              <CardContent className="p-5 md:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Size Measurements</h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Add measurements for each size (in cm).
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Row
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.rows.map((row, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <p className="text-sm font-semibold">
                          Size {index + 1}
                        </p>

                        {formData.rows.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveRow(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        {/* Size */}
                        <div>
                          <label className="text-xs font-medium">Size</label>

                          <select
                            value={formData.rows[index].size}
                            onChange={(e) =>
                              handleRowInputChange(index, "size", e.target.value)
                            }
                            className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="">Select size</option>
                            {sizeVar.sizes.map((size) => (
                              <option key={size._id} value={size._id}>
                                {size.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Height */}
                        <div>
                          <label className="text-xs font-medium">
                            Height (cm)
                          </label>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.height.min}
                              onChange={(e) =>
                                handleRowInputChange(
                                  index,
                                  "height",
                                  e.target.value,
                                  "min",
                                )
                              }
                              placeholder="Min (cm)"
                            />

                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.height.max}
                              onChange={(e) =>
                                handleRowInputChange(
                                  index,
                                  "height",
                                  e.target.value,
                                  "max",
                                )
                              }
                              placeholder="Max (cm)"
                            />
                          </div>
                        </div>

                        {/* Chest */}
                        <div>
                          <label className="text-xs font-medium">
                            Chest (cm)
                          </label>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.chest.min}
                              onChange={(e) =>
                                handleRowInputChange(
                                  index,
                                  "chest",
                                  e.target.value,
                                  "min",
                                )
                              }
                              placeholder="Min (cm)"
                            />

                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.chest.max}
                              onChange={(e) =>
                                handleRowInputChange(
                                  index,
                                  "chest",
                                  e.target.value,
                                  "max",
                                )
                              }
                              placeholder="Max (cm)"
                            />
                          </div>
                        </div>

                        {/* Waist */}
                        <div>
                          <label className="text-xs font-medium">
                            Waist (cm)
                          </label>

                          <div className="mt-2 grid grid-cols-2 gap-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.waist.min}
                              onChange={(e) =>
                                handleRowInputChange(
                                  index,
                                  "waist",
                                  e.target.value,
                                  "min",
                                )
                              }
                              placeholder="Min (cm)"
                            />

                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={row.waist.max}
                              onChange={(e) =>
                                handleRowInputChange(
                                  index,
                                  "waist",
                                  e.target.value,
                                  "max",
                                )
                              }
                              placeholder="Max (cm)"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => dispatch(toogleAddModal(false))}
              >
                Cancel
              </Button>

              <Button type="submit">
                {editingSizeChart ? "Update Size Chart" : "Create Size Chart"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
