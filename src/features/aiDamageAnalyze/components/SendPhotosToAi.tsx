//todo translate
import RntButton from "@/components/common/rntButton";
import DotStatus from "@/components/dotStatus";
import React from "react";
import useAiDamageCheck, { AiCheckStatus } from "../hooks/useAiDamageCheck";
import { isEmpty } from "@/utils/string";

function getStatusText(status: AiCheckStatus): { type: "error" | "success" | "warning"; text: string } {
  switch (status) {
    case "loading":
      return { type: "warning", text: "Loading..." };
    case "no pre-trip photos":
      return { type: "error", text: "No pre-trip photos" };
    case "ready to pre-trip check":
      return { type: "success", text: "Ready to pre-trip check" };
    case "pre-trip checking":
      return { type: "warning", text: "Pre-trip check in progress..." };
    case "pre-trip checked":
    case "ready to post-trip analyze":
      return { type: "success", text: "Pre-trip check successful" };
    case "post-trip analyzing":
      return { type: "warning", text: "Post-trip analyze in progress..." };
    case "post-trip analyzed successful":
      return { type: "success", text: "Analyze successful" };
    case "post-trip analyzed damage":
      return { type: "error", text: "Damage was found! Check details for more information!" };
  }
}

function SendPhotosToAi({ tripId }: { tripId: number }) {
  const { aiCheckReport, startPreTripCheck, startPostTripsAnalyze } = useAiDamageCheck(tripId);

  async function handlePreTripCheckClick() {
    //TODO toast messages
    const result = await startPreTripCheck();
  }

  async function handlePostTripAnalyzeClick() {
    //TODO toast messages
    const result = await startPostTripsAnalyze();
  }

  async function handleViewDamageAnalyzeClick() {
    if (!isEmpty(aiCheckReport.postTripReportUrl)) {
      window.open(aiCheckReport.postTripReportUrl, "_blank");
      return;
    }
    if (!isEmpty(aiCheckReport.preTripReportUrl)) {
      window.open(aiCheckReport.preTripReportUrl, "_blank");
      return;
    }
  }

  const isPreTripReportReady =
    aiCheckReport.status === "pre-trip checked" ||
    aiCheckReport.status === "ready to post-trip analyze" ||
    aiCheckReport.status === "post-trip analyzing";

  const isDamageAnalyzeFinished =
    aiCheckReport.status === "post-trip analyzed successful" || aiCheckReport.status === "post-trip analyzed damage";
  const { type, text } = getStatusText(aiCheckReport.status);
  return (
    <div className="flex flex-col gap-4">
      <h3>AI Damage analyze</h3>
      <RntButton disabled={aiCheckReport.status !== "ready to pre-trip check"} onClick={handlePreTripCheckClick}>
        Pre-trip Check
      </RntButton>
      {!isDamageAnalyzeFinished && (
        <RntButton
          disabled={aiCheckReport.status !== "ready to post-trip analyze"}
          onClick={handlePostTripAnalyzeClick}
        >
          Analyze Damages
        </RntButton>
      )}
      {isPreTripReportReady && <RntButton onClick={handleViewDamageAnalyzeClick}>View pre trip report</RntButton>}
      {isDamageAnalyzeFinished && <RntButton onClick={handleViewDamageAnalyzeClick}>View damage report</RntButton>}
      <DotStatus color={type} text={text} />
    </div>
  );
}

export default SendPhotosToAi;
