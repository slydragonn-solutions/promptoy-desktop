import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import { Button } from "../ui/button";
import { X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { useTheme } from "../theme/theme-provider";

interface DiffEditorProps {
  original: string;
  modified: string;
  originalTitle?: string;
  modifiedTitle?: string;
  onClose: () => void;
}

export function DiffEditor({
  original,
  modified,
  originalTitle = "Original",
  modifiedTitle = "Modified",
  onClose,
}: DiffEditorProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { editor: editorSettings } = useSettingsStore();
  const { theme } = useTheme()

  // Show a loading state when versions change
  useEffect(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => setIsRefreshing(false), 100);
    return () => clearTimeout(timer);
  }, [original, modified]);

  return (
    <div className="relative flex flex-col h-full">
      <div className="flex flex-col p-2 border-b">
        <div className="flex justify-between items-center">
          <div className="flex-1 flex items-center gap-2">
            <span className="text-sm text-neutral-600 dark:text-neutral-400">Comparing Versions</span>
            {isRefreshing && <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden pt-2">
        <MonacoDiffEditor
          height="calc(100vh - 357px)"
          language="markdown"
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            originalEditable: false,
            scrollBeyondLastLine: false,
            fontSize: editorSettings.fontSize,
            renderOverviewRuler: false,
            scrollbar: {
              vertical: "hidden",
              horizontal: "hidden",
              handleMouseWheel: true,
            },
            renderSideBySide: true,
            wordWrap: "on",
          }}
          originalModelPath="original"
          modifiedModelPath="modified"
          theme={theme === "system" ? "vs-dark" : theme === "dark" ? "vs-dark" : "light"}
        />
      </div>
      <div className="flex justify-between items-center p-2 border-t text-xs text-muted-foreground">
        <div>{originalTitle}</div>
        <div className="text-muted-foreground/50">vs</div>
        <div>{modifiedTitle}</div>
      </div>
    </div>
  );
}
