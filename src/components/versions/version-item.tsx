import { PromptContent } from "@/types/prompts";
import { CheckIcon, Edit2, TrashIcon, GitCompare } from "lucide-react";

interface VersionItemProps {
  version: PromptContent;
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
  isActive,
  isComparing = false,
  isCurrentVersion = false,
  onSelect,
  onRename,
  onDelete,
  onCompare,
}: VersionItemProps) {
  const displayText = version.name || new Date(version.date).toLocaleString();

  return (
    <div
      className={`group flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-neutral-100 ${
        isActive ? 'bg-blue-50' : ''
      }`}
      onClick={() => onSelect(version)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium truncate max-w-[200px]">{displayText}</p>
          <div className="flex items-center gap-1">
            {!isComparing && (
              <button
                className="p-1 rounded-full hover:bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(version);
                }}
                title="Rename version"
                disabled={isComparing}
              >
                <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {!isCurrentVersion && (
              <button
                className={`p-1 rounded-full transition-opacity ${
                  isComparing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } ${isActive ? 'text-blue-500' : 'text-muted-foreground hover:text-blue-500'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCompare?.(version);
                }}
                title={isActive ? 'Currently viewing this version' : 'Compare with this version'}
                disabled={isActive}
              >
                <GitCompare className="w-3.5 h-3.5" />
              </button>
            )}
            {!isComparing && (
              <button
                className="p-1 rounded-full hover:bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(version);
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
      {isActive && <CheckIcon className="w-4 h-4 text-blue-400" />}
    </div>
  );
}