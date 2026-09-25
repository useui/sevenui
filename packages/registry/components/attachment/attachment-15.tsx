"use client";

import * as React from "react";
import {
  CircleAlertIcon,
  FileTextIcon,
  FileUserIcon,
  FileVideoIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/registry/base/ui/attachment";
import { Button } from "@/registry/base/ui/button";
import { Progress } from "@/registry/base/ui/progress";
import { Spinner } from "@/registry/base/ui/spinner";

type UploadState = "uploading" | "processing" | "error" | "done";

type Upload = {
  id: string;
  name: string;
  size: string;
  kind: "doc" | "video";
  progress: number;
  state: UploadState;
  error?: string;
};

const resumeSample: Omit<Upload, "progress" | "state"> = {
  id: "resume",
  name: "dana-whitfield-resume.pdf",
  size: "248 KB",
  kind: "doc",
};

const portfolioSamples: Upload[] = [
  {
    id: "case-study",
    name: "fintech-onboarding-case-study.pdf",
    size: "6.4 MB",
    kind: "doc",
    progress: 100,
    state: "done",
  },
  {
    id: "reel",
    name: "motion-reel-2026.mov",
    size: "312 MB",
    kind: "video",
    progress: 0,
    state: "error",
    error: "Over the 100 MB limit — share a link instead",
  },
];

function describe(upload: Upload) {
  if (upload.state === "uploading") return `Uploading · ${upload.progress}%`;
  if (upload.state === "processing") return "Scanning for viruses…";
  if (upload.state === "error") return upload.error ?? "Upload failed";
  return `${upload.size} · Ready`;
}

function UploadRow({
  upload,
  onRemove,
}: {
  upload: Upload;
  onRemove: () => void;
}) {
  const busy = upload.state === "uploading" || upload.state === "processing";
  return (
    <Attachment state={upload.state} className="w-full">
      <AttachmentMedia>
        {busy ? (
          <Spinner />
        ) : upload.state === "error" ? (
          <CircleAlertIcon aria-hidden="true" />
        ) : upload.kind === "video" ? (
          <FileVideoIcon aria-hidden="true" />
        ) : (
          <FileTextIcon aria-hidden="true" />
        )}
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{upload.name}</AttachmentTitle>
        <AttachmentDescription>{describe(upload)}</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction
          aria-label={busy ? `Cancel ${upload.name}` : `Remove ${upload.name}`}
          onClick={onRemove}
        >
          <XIcon aria-hidden="true" />
        </AttachmentAction>
      </AttachmentActions>
      {upload.state === "uploading" ? (
        <Progress
          value={upload.progress}
          aria-label={`Uploading ${upload.name}`}
          className="basis-full px-0.5 pb-0.5"
        />
      ) : null}
    </Attachment>
  );
}

export default function Attachment15() {
  const [resume, setResume] = React.useState<Upload | null>(null);
  const [portfolio, setPortfolio] = React.useState(portfolioSamples);
  const [submitted, setSubmitted] = React.useState(false);

  const resumeState = resume?.state;

  // Simulate the upload lifecycle: bytes transfer, then a server-side scan.
  React.useEffect(() => {
    if (resumeState === "uploading") {
      const interval = window.setInterval(() => {
        setResume((current) => {
          if (current?.state !== "uploading") return current;
          const progress = Math.min(current.progress + 12, 100);
          return {
            ...current,
            progress,
            state: progress === 100 ? "processing" : "uploading",
          };
        });
      }, 220);
      return () => window.clearInterval(interval);
    }
    if (resumeState === "processing") {
      const timeout = window.setTimeout(() => {
        setResume((current) => (current ? { ...current, state: "done" } : current));
      }, 1200);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [resumeState]);

  function startResumeUpload() {
    setSubmitted(false);
    setResume({ ...resumeSample, progress: 0, state: "uploading" });
  }

  const canSubmit = resume?.state === "done";

  return (
    <form
      aria-labelledby="attachment-15-title"
      className="w-full max-w-md rounded-2xl border bg-card p-5 text-card-foreground"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit) setSubmitted(true);
      }}
    >
      <h3 id="attachment-15-title" className="text-base font-medium">
        Senior Product Designer
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Payments team · Remote, EU time zones
      </p>

      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <p id="attachment-15-resume" className="text-sm font-medium">
            Résumé
          </p>
          <span className="text-xs text-muted-foreground">Required · PDF, max 10 MB</span>
        </div>
        <div aria-live="polite">
          {resume ? (
            <UploadRow
              upload={resume}
              onRemove={() => {
                setResume(null);
                setSubmitted(false);
              }}
            />
          ) : (
            <Attachment state="idle" className="w-full hover:bg-muted/50">
              <AttachmentMedia className="bg-transparent text-muted-foreground">
                <FileUserIcon aria-hidden="true" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>Upload your résumé</AttachmentTitle>
                <AttachmentDescription>
                  We parse it to prefill your work history
                </AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <UploadIcon aria-hidden="true" className="mr-1 size-4 text-muted-foreground" />
              </AttachmentActions>
              <AttachmentTrigger
                aria-label="Upload your résumé"
                className="rounded-2xl focus-visible:ring-2 focus-visible:ring-ring"
                onClick={startResumeUpload}
              />
            </Attachment>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <p id="attachment-15-portfolio" className="text-sm font-medium">
            Portfolio
          </p>
          <span className="text-xs text-muted-foreground">Optional · up to 3 files</span>
        </div>
        <ul aria-labelledby="attachment-15-portfolio" className="flex flex-col gap-2">
          {portfolio.map((upload) => (
            <li key={upload.id}>
              <UploadRow
                upload={upload}
                onRemove={() =>
                  setPortfolio((current) => current.filter((item) => item.id !== upload.id))
                }
              />
            </li>
          ))}
        </ul>
        {portfolio.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No files yet. A Figma or Dribbble link in your résumé works just as well.
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {submitted
            ? "Application sent. We reply within 5 business days."
            : canSubmit
              ? "Everything is ready to send."
              : "Add your résumé to continue."}
        </p>
        <Button type="submit" size="sm" disabled={!canSubmit || submitted}>
          {submitted ? "Submitted" : "Submit application"}
        </Button>
      </div>
    </form>
  );
}
