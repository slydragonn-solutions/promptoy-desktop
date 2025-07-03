import { DiffEditor as MonacoDiffEditor } from "@monaco-editor/react";
import { Button } from "../ui/button";
import { X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

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
            <span className="text-sm font-medium">Comparing Versions</span>
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
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <div className="flex-1 truncate max-w-[45%] pr-2" title={originalTitle}>
            <div className="font-medium text-foreground/90">{originalTitle?.split(' (')[0]}</div>
            <div className="text-xs opacity-80">{originalTitle?.match(/\(([^)]+)\)/)?.[1] || ''}</div>
          </div>
          <div className="flex items-center px-2">
            <span className="text-muted-foreground/60">→</span>
          </div>
          <div className="flex-1 truncate max-w-[45%] pl-2 text-right" title={modifiedTitle}>
            <div className="font-medium text-foreground/90">{modifiedTitle?.split(' (')[0]}</div>
            <div className="text-xs opacity-80">{modifiedTitle?.match(/\(([^)]+)\)/)?.[1] || ''}</div>
          </div>
        </div>

      </div>
      <div className="flex-1 overflow-hidden">
        <MonacoDiffEditor
          height="100%"
          language="markdown"
          original={original}
          modified={modified}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            originalEditable: false,
            scrollBeyondLastLine: false,
            fontSize: 13,
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
