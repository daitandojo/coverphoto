"use client";

import { motion } from "framer-motion";
import { usePortraitStore } from "@/lib/store";

type StepId = "upload" | "styles" | "generate" | "review" | "library";

interface Step {
  id: StepId;
  label: string;
  icon: string;
}

const STEPS: Step[] = [
  { id: "upload", label: "Upload", icon: "📷" },
  { id: "styles", label: "Styles", icon: "✦" },
  { id: "generate", label: "Generate", icon: "⚡" },
  { id: "review", label: "Review", icon: "✨" },
  { id: "library", label: "Library", icon: "📚" },
];

function getActiveStep(
  uploadedCount: number,
  totalSelected: number,
  wbCount: number,
  libCount: number,
  generating: boolean
): StepId {
  if (generating) return "generate";
  if (wbCount > 0) return "review";
  if (libCount > 0 && wbCount === 0) return "library";
  if (totalSelected > 0 && uploadedCount >= 2) return "generate";
  if (uploadedCount > 0) return "styles";
  return "upload";
}

function getCompletedSteps(
  uploadedCount: number,
  totalSelected: number,
  wbCount: number,
  libCount: number,
  generating: boolean
): StepId[] {
  const completed: StepId[] = [];
  if (uploadedCount >= 2) completed.push("upload");
  if (totalSelected > 0) completed.push("styles");
  if (generating || wbCount > 0) completed.push("generate");
  if (wbCount > 0) completed.push("review");
  if (libCount > 0) completed.push("library");
  return completed;
}

export default function WorkflowWizard() {
  const { uploadedImages, totalSelected, workbenchPortraits, libraryPortraits } =
    usePortraitStore();
  const uploadedCount = uploadedImages.length;
  const selected = totalSelected();
  const wbCount = workbenchPortraits.length;
  const libCount = libraryPortraits.length;
  const generating = workbenchPortraits.some((p) => p.status === "generating");

  const active = getActiveStep(uploadedCount, selected, wbCount, libCount, generating);
  const completed = getCompletedSteps(uploadedCount, selected, wbCount, libCount, generating);

  return (
    <div className="flex items-center justify-center gap-0 md:gap-1 px-2 py-2 md:py-2.5 border-b border-white/5 bg-[rgba(8,8,8,0.5)]">
      <nav className="flex items-center gap-0 md:gap-2" aria-label="Workflow progress">
        {STEPS.map((step, i) => {
          const isActive = step.id === active;
          const isCompleted = completed.includes(step.id);
          const isDisabled = !isActive && !isCompleted;

          return (
            <div key={step.id} className="flex items-center gap-0 md:gap-2">
              {/* Step dot + label */}
              <motion.div
                layout
                className={`flex items-center gap-1 md:gap-1.5 px-1.5 md:px-2.5 py-1 rounded-full transition-all ${
                  isActive
                    ? "bg-[rgba(200,185,154,0.12)] border border-[rgba(200,185,154,0.3)]"
                    : isCompleted
                    ? "bg-[rgba(200,185,154,0.06)] border border-transparent"
                    : "border border-transparent opacity-30"
                }`}
              >
                {/* Icon circle */}
                <span
                  className={`flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full text-[9px] md:text-[10px] transition-all ${
                    isActive
                      ? "bg-[#C8B99A] text-[#080808]"
                      : isCompleted
                      ? "bg-[rgba(200,185,154,0.2)] text-[#C8B99A]"
                      : "bg-[rgba(255,255,255,0.05)] text-[rgba(240,237,232,0.3)]"
                  }`}
                >
                  {isCompleted ? "✓" : step.icon}
                </span>

                {/* Label — hidden on very small screens, visible from sm up */}
                <span
                  className={`hidden md:inline text-[9px] tracking-wider uppercase whitespace-nowrap transition-all ${
                    isActive
                      ? "text-[#C8B99A]"
                      : isCompleted
                      ? "text-[rgba(200,185,154,0.6)]"
                      : "text-[rgba(240,237,232,0.3)]"
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {step.label}
                </span>

                {/* Mobile: show only icon + single-letter label */}
                <span
                  className={`md:hidden text-[7px] tracking-wider uppercase ${
                    isActive
                      ? "text-[#C8B99A]"
                      : isCompleted
                      ? "text-[rgba(200,185,154,0.5)]"
                      : "text-[rgba(240,237,232,0.25)]"
                  }`}
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {step.label.slice(0, 2)}
                </span>
              </motion.div>

              {/* Connector line between steps */}
              {i < STEPS.length - 1 && (
                <div
                  className={`hidden md:block w-3 lg:w-5 h-px transition-all ${
                    completed.includes(step.id) ? "bg-[rgba(200,185,154,0.3)]" : "bg-white/5"
                  }`}
                />
              )}
              {i < STEPS.length - 1 && (
                <span className="md:hidden text-[6px] text-white/10" style={{ fontFamily: "'DM Mono', monospace" }}>
                  —
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
