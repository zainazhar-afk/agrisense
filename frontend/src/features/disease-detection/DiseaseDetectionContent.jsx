/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  Expand,
  LoaderCircle,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
  Waves,
} from "lucide-react";
import { useToast } from "@/components/system/AppProviders";
import { getDiseaseInfo, predictDisease } from "@/utils/api";

function normalizePredictions(raw) {
  const list = Array.isArray(raw?.predictions)
    ? raw.predictions
    : Array.isArray(raw?.top_predictions)
      ? raw.top_predictions
      : [];

  const normalized = list.map((item) => {
    const disease = item?.disease || item?.class || item?.label || "Unknown";
    const confidenceValue = item?.confidence_percent || item?.confidence || item?.score || "0%";
    return {
      disease,
      confidence:
        typeof confidenceValue === "number"
          ? `${(confidenceValue * 100).toFixed(1)}%`
          : String(confidenceValue),
    };
  });

  if (normalized.length > 0) {
    return normalized;
  }

  const fallbackDisease = raw?.top_prediction?.disease || raw?.class || raw?.disease || raw?.label;
  const fallbackConfidence =
    raw?.top_prediction?.confidence_percent || raw?.confidence_percent || raw?.confidence || raw?.score;

  if (!fallbackDisease) {
    return [];
  }

  return [
    {
      disease: fallbackDisease,
      confidence:
        typeof fallbackConfidence === "number"
          ? `${(fallbackConfidence * 100).toFixed(1)}%`
          : String(fallbackConfidence || "0%"),
    },
  ];
}

function EmptyScanState() {
  return (
    <div className="empty-state flex min-h-[340px] flex-col items-center justify-center rounded-[1.7rem] px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] border border-emerald-100 bg-slate-100/78">
        <Upload className="h-7 w-7 text-emerald-500" />
      </div>
      <div className="mt-5 font-display text-2xl text-slate-950">Drop a leaf image into the scan deck</div>
      <div className="mt-3 max-w-sm text-sm leading-7 text-slate-600">
        A clear close-up image with visible symptoms gives the model a stronger first read.
      </div>
    </div>
  );
}

function AnalysisSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="rounded-[1.9rem] border border-emerald-100 bg-slate-100/76 p-5">
        <div className="skeleton-line h-4 w-28" />
        <div className="skeleton-line mt-5 h-10 w-[70%] rounded-2xl" />
        <div className="skeleton-line mt-4 h-3 w-[92%]" />
        <div className="skeleton-line mt-3 h-3 w-[84%]" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="metric-tile rounded-[1.6rem]">
            <div className="skeleton-line h-3 w-20" />
            <div className="skeleton-line mt-4 h-8 w-28 rounded-2xl" />
          </div>
          <div className="metric-tile rounded-[1.6rem]">
            <div className="skeleton-line h-3 w-20" />
            <div className="skeleton-line mt-4 h-8 w-24 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[1.8rem] border border-emerald-100 bg-slate-100/76 p-5">
          <div className="skeleton-line h-4 w-32" />
          <div className="mt-5 space-y-4">
            {[0, 1, 2].map((item) => (
              <div key={item}>
                <div className="flex items-center justify-between">
                  <div className="skeleton-line h-3 w-28" />
                  <div className="skeleton-line h-3 w-12" />
                </div>
                <div className="skeleton-line mt-3 h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {[0, 1].map((panel) => (
            <div key={panel} className="rounded-[1.8rem] border border-emerald-100 bg-slate-100/76 p-5">
              <div className="skeleton-line h-4 w-36" />
              <div className="mt-4 space-y-3">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-emerald-100 bg-slate-200/65 px-4 py-4">
                    <div className="skeleton-line h-3 w-[92%]" />
                    <div className="skeleton-line mt-3 h-3 w-[74%]" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DiseaseDetectionContent() {
  const { pushToast } = useToast();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [showZoom, setShowZoom] = useState(false);

  const topPrediction = useMemo(() => result?.predictions?.[0] || null, [result]);

  const handleFile = (file) => {
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please upload a JPG, PNG, or WEBP leaf image.");
      pushToast({
        title: "Unsupported file",
        message: "Upload a JPG, PNG, or WEBP leaf image for analysis.",
        type: "error",
      });
      return;
    }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null);
    setError("");
    pushToast({
      title: "Leaf image loaded",
      message: "The scan deck is ready for disease analysis.",
      type: "success",
    });
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      setError("Upload a cotton leaf image before starting analysis.");
      pushToast({
        title: "No scan loaded",
        message: "Upload a leaf image before launching the disease analysis.",
        type: "error",
      });
      return;
    }

    setAnalyzing(true);
    setError("");

    try {
      const prediction = await predictDisease(uploadedFile, 3);
      const predictions = normalizePredictions(prediction);
      const lead = predictions[0];
      const diseaseInfo =
        lead?.disease && lead.disease !== "Unknown"
          ? await getDiseaseInfo(lead.disease).catch(() => null)
          : null;

      setResult({
        predictions,
        diseaseInfo: {
          severity: diseaseInfo?.severity || "Not available",
          symptoms: diseaseInfo?.symptoms || [],
          treatment: diseaseInfo?.treatment || [],
        },
      });

      pushToast({
        title: "Analysis complete",
        message: "The leaf scan has been processed and the diagnosis board is ready.",
        type: "success",
      });
    } catch (analysisError) {
      setError(analysisError.message || "Analysis failed.");
      pushToast({
        title: "Analysis failed",
        message: analysisError.message || "The disease API could not process this image.",
        type: "error",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setPreviewUrl("");
    setResult(null);
    setError("");
    setShowZoom(false);
    pushToast({
      title: "Scan deck cleared",
      message: "You can start again with a new crop image.",
      type: "info",
    });
  };

  const captureNotes = [
    "Keep the damaged leaf centered and let it fill most of the frame.",
    "Use natural light when possible and avoid heavy shadow or blur.",
    "If symptoms vary across the leaf, capture the most severe section first.",
  ];

  const telemetry = [
    ["Top-k ranking", "Three ranked predictions"],
    ["Support data", "Severity, symptoms, treatment"],
    ["Scan behavior", "FastAPI model response"],
  ];

  const quickChecks = [
    "Leaf fills most of frame",
    "Natural light or soft shade",
    "Most severe symptom visible",
  ];

  return (
    <>
      <section className="section-dark pt-6">
        <div className="page-wrap pb-16">
          <div className="panel rounded-[2.4rem] p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(280px,0.72fr)_minmax(420px,0.92fr)_minmax(260px,0.56fr)] xl:items-start">
              <div>
                <div>
                  <div className="eyebrow">
                    <Camera className="h-3.5 w-3.5 text-emerald-500" />
                    crop vision lab
                  </div>
                  <h1 className="mt-6 max-w-[8ch] font-display text-[clamp(3rem,5.2vw,5.4rem)] leading-[0.9] text-slate-950">
                    Diagnose cotton leaf issues faster.
                  </h1>
                  <p className="mt-5 max-w-md text-sm leading-8 text-slate-600">
                    Upload a clear crop image, run the disease scan, and compare symptoms and treatment guidance in one place.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    {telemetry.map(([label, text]) => (
                      <div key={label} className="metric-tile rounded-[1.45rem] bg-slate-100/78">
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
                        <div className="mt-2 text-sm font-medium text-slate-950">{text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="app-window min-h-[560px] xl:min-h-[620px]">
                  <div className="window-header">
                    <span className="window-dot" />
                    <span className="window-dot" />
                    <span className="window-dot" />
                    <span className="ml-3 text-xs uppercase tracking-[0.22em] text-slate-400">scan deck</span>
                  </div>

                  <div className="p-5">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                      }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        handleFile(event.dataTransfer.files?.[0]);
                      }}
                      className={`relative overflow-hidden rounded-[1.75rem] border-2 border-dashed p-5 transition ${
                        dragging ? "border-emerald-300 bg-emerald-100/60" : "border-emerald-100 bg-slate-100/70"
                      }`}
                    >
                      {analyzing ? <div className="scan-overlay" /> : null}
                      {previewUrl ? (
                        <div className="relative overflow-hidden rounded-[1.4rem] border border-emerald-100">
                          <img src={previewUrl} alt="Leaf preview" className="h-[340px] w-full object-cover" />
                          <div className="absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,rgba(223,232,244,0),rgba(223,232,244,0.95))] p-4">
                            <div className="flex items-end justify-between gap-4">
                              <div>
                                <div className="text-sm font-medium text-slate-950">{uploadedFile?.name}</div>
                                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">capture ready for analysis</div>
                              </div>
                              <button type="button" onClick={() => setShowZoom(true)} className="button-secondary px-3 py-2 text-xs">
                                <Expand className="h-3.5 w-3.5" />
                                Zoom
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <EmptyScanState />
                      )}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                      <label className="button-secondary cursor-pointer">
                        <Upload className="h-4 w-4" />
                        Choose image
                        <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
                      </label>
                      <button
                        type="button"
                        onClick={handleAnalyze}
                        disabled={analyzing || !uploadedFile}
                        className="button-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {analyzing ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Analyzing
                          </>
                        ) : (
                          <>
                            <ScanLine className="h-4 w-4" />
                            Run analysis
                          </>
                        )}
                      </button>
                      <button type="button" onClick={reset} className="button-secondary">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    {error ? (
                      <div className="mt-4 rounded-[1.3rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                        {error}
                      </div>
                    ) : null}
                  </div>
                </div>

              <div className="space-y-4">
                <div className="panel rounded-[1.8rem] p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <ShieldCheck className="h-4 w-4 text-lime-500" />
                    Capture guidance
                  </div>
                  <div className="mt-4 space-y-3">
                    {captureNotes.map((item) => (
                      <div key={item} className="rounded-[1.2rem] border border-emerald-100 bg-slate-100/76 px-4 py-3 text-sm leading-7 text-slate-600">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel rounded-[1.8rem] p-5">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                    <Activity className="h-4 w-4 text-emerald-500" />
                    Quick checklist
                  </div>
                  <div className="mt-4 space-y-3">
                    {quickChecks.map((item) => (
                      <div key={item} className="flex items-center gap-3 rounded-[1.15rem] border border-emerald-100 bg-slate-100/76 px-4 py-3 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {analyzing ? (
            <div className="panel mt-6 rounded-[2.4rem] p-6 md:p-8">
              <div className="mb-5 flex items-center gap-2 text-sm font-medium text-slate-950">
                <Waves className="h-4 w-4 text-emerald-500" />
                Running disease analysis
              </div>
              <AnalysisSkeleton />
            </div>
          ) : null}

          {result && topPrediction ? (
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} className="panel mt-6 rounded-[2.4rem] p-6 md:p-8">
              <div className="grid gap-8 xl:grid-cols-[0.92fr_1.08fr]">
                <div>
                  <div className="eyebrow">
                    <AlertTriangle className="h-3.5 w-3.5 text-emerald-500" />
                    lead diagnosis
                  </div>
                  <h2 className="section-title mt-6">{topPrediction.disease}</h2>
                  <p className="mt-5 text-sm leading-8 text-slate-600">
                    Highest confidence result from the uploaded cotton leaf image. Use it as a strong signal, then confirm
                    against field symptoms before acting.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="metric-tile rounded-[1.6rem] bg-slate-100/78">
                      <div className="text-sm text-slate-500">Confidence</div>
                      <div className="metric-value mt-3">{topPrediction.confidence}</div>
                    </div>
                    <div className="metric-tile rounded-[1.6rem] bg-slate-100/78">
                      <div className="text-sm text-slate-500">Severity</div>
                      <div className="mt-3 font-display text-3xl text-slate-950">{result.diseaseInfo.severity}</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(228,236,220,0.92),rgba(239,244,234,0.94))] p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-950">
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                      Action framing
                    </div>
                    <div className="mt-3 text-sm leading-7 text-slate-600">
                      Compare symptoms with the top diagnosis first. If the field pattern still feels mixed, capture a second
                      image from another affected area before deciding on treatment.
                    </div>
                  </div>
                </div>

                <div className="grid gap-5">
                  <div className="rounded-[1.8rem] border border-emerald-100 bg-slate-100/72 p-5">
                    <div className="text-sm font-medium text-slate-950">Prediction ranking</div>
                    <div className="mt-5 space-y-4">
                      {result.predictions.map((prediction) => (
                        <div key={`${prediction.disease}-${prediction.confidence}`}>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{prediction.disease}</span>
                            <span>{prediction.confidence}</span>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-[linear-gradient(90deg,#2563eb,#06b6d4,#84cc16)]"
                              style={{ width: prediction.confidence }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <div className="rounded-[1.8rem] border border-emerald-100 bg-slate-100/76 p-5">
                      <div className="text-sm font-medium text-slate-950">Symptoms to compare</div>
                      <div className="mt-4 space-y-3">
                        {(result.diseaseInfo.symptoms.length ? result.diseaseInfo.symptoms : ["No symptom details returned."]).map((item) => (
                          <div key={item} className="flex gap-3 rounded-[1.2rem] border border-emerald-100 bg-slate-100/82 px-4 py-3 text-sm leading-7 text-slate-600">
                            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-lime-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.8rem] border border-emerald-100 bg-slate-100/76 p-5">
                      <div className="text-sm font-medium text-slate-950">Treatment playbook</div>
                      <div className="mt-4 space-y-3">
                        {(result.diseaseInfo.treatment.length ? result.diseaseInfo.treatment : ["No treatment details returned."]).map((item) => (
                          <div key={item} className="flex gap-3 rounded-[1.2rem] border border-emerald-100 bg-slate-100/82 px-4 py-3 text-sm leading-7 text-slate-600">
                            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-emerald-500" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </section>

      {showZoom && previewUrl ? (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-md">
          <button type="button" className="absolute inset-0" onClick={() => setShowZoom(false)} aria-label="Close zoom view" />
          <div className="panel relative z-10 w-full max-w-5xl rounded-[2rem] p-4">
            <div className="mb-4 flex items-center justify-between gap-4 px-2">
              <div>
                <div className="text-sm font-medium text-slate-950">{uploadedFile?.name || "Leaf preview"}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">zoom review</div>
              </div>
              <button type="button" onClick={() => setShowZoom(false)} className="button-secondary px-3 py-2 text-xs">
                Close
              </button>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-emerald-100">
              <img src={previewUrl} alt="Zoomed leaf preview" className="max-h-[78vh] w-full object-contain bg-slate-200/60" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
