import { PromptContent } from "@/types/prompts";
import { CheckIcon, Edit2, TrashIcon, GitCompare } from "lucide-react";
import { useState } from "react";
import Alert from "../common/alert";
interface VersionItemProps {
  version: PromptContent;
  compareVersion?: PromptContent;
  isActive: boolean;
  isComparing?: boolean;
  isCurrentVersion?: boolean;
  onSelect: (version: PromptContent) => void;
  onRename: (version: PromptContent) => void;
  onDelete: (version: PromptContent) => void;
  onCompare?: (version: PromptContent) => void;
}

export default function VersionItem({
  version,
  compareVersion,
  isActive,
  isComparing = false,
  isCurrentVersion = false,
  onSelect,
  onRename,
  onDelete,
  onCompare,
}: VersionItemProps) {
  const displayText = version.name || new Date(version.date).toLocaleString();
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = () => {
    onDelete(version);
  }

  return (
    <>
    <div
      className={`group flex items-center justify-between p-2 rounded-sm cursor-pointer border ${
        isActive || isCurrentVersion ? 'bg-indigo-50 border-indigo-200 hover:bg-indigo-50 dark:bg-indigo-950 dark:border-indigo-600 dark:text-neutral-200 font-bold' : 'bg-neutral-100 border-neutral-100 hover:bg-neutral-200/60 dark:bg-neutral-800 dark:border-neutral-800 dark:text-neutral-400'
      }`}
      onClick={isComparing ? undefined : () => onSelect(version)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate max-w-[200px]">{displayText}</p>
          <div className="flex items-center gap-1">
            {!isComparing && (
              <button
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(version);
                }}
                title="Rename version"
                disabled={isComparing}
              >
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground hover:text-indigo-500" />
              </button>
            )}
            {!isCurrentVersion && (
              <button
                className={`p-1 rounded-full transition-opacity ${
                  isComparing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } ${compareVersion?.date.toString() === version.date.toString() ? 'text-indigo-500' : 'text-muted-foreground hover:text-indigo-500'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare?.(version);
                }}
                title={compareVersion?.date.toString() === version.date.toString() ? 'Currently viewing this version' : 'Compare with this version'}
                disabled={compareVersion?.date.toString() === version.date.toString()}
              >
                <GitCompare className="w-3.5 h-3.5" />
              </button>
            )}
            {!isComparing && (
              <button
                className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleting(true);
                }}
                title="Delete version"
                disabled={isComparing}
              >
                <TrashIcon className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
              </button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {new Date(version.date).toLocaleString()}
        </p>
      </div>
      {isActive && <CheckIcon className="w-4 h-4 text-neutral-500" />}
    </div>
    <Alert
        title="Version deleted"
        description="The version has been deleted successfully."
        open={isDeleting}
        onOpenChange={setIsDeleting}
        onAction={handleDelete}
        actionText="Delete"
    />
    </>
  );
}