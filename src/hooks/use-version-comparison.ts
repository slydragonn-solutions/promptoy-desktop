import { useState, useEffect } from "react";
import { promptsStore } from "@/store/prompts-store";

export function useVersionComparison() {
  const { selectedPrompt } = promptsStore();
  const [isComparing, setIsComparing] = useState(false);
  const [compareVersion, setCompareVersion] = useState<{
    content: string;
    date: string;
    name?: string;
  } | null>(null);

  // Reset comparison state when selected prompt changes
  useEffect(() => {
    setIsComparing(false);
    setCompareVersion(null);
  }, [selectedPrompt?.id]);

  const handleCompareVersion = (version: { content: string; date: string; name?: string }) => {
    setCompareVersion(version);
    setIsComparing(true);
  };

  const handleCloseCompare = () => {
    setIsComparing(false);
    setCompareVersion(null);
  };

  return {
    isComparing,
    compareVersion,
    handleCompareVersion,
    handleCloseCompare,
  };
}
