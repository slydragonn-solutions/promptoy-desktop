import { Prompt } from "@/types/prompts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    EllipsisVerticalIcon,
    FileTextIcon,
    Trash2,
    Heart,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AIChat } from "@/components/ai-chat";

interface EditorHeaderProps {
    promptName: string;
    isFavorite: boolean;
    isSaving: boolean;
    setIsRenameDialogOpen: (open: boolean) => void;
    setNewName: (name: string) => void;
    handleUpdatePrompt: (prompt: Partial<Prompt>) => Promise<boolean>;
    handleCopyToClipboard: () => void;
    handleDeletePrompt: () => void;
}

export default function EditorHeader({
    promptName,
    isFavorite,
    isSaving,
    setIsRenameDialogOpen,
    setNewName,
    handleUpdatePrompt,
    handleCopyToClipboard,
    handleDeletePrompt,
}: EditorHeaderProps) {
    return (
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <h1
              className="font-semibold text-xl cursor-text text-neutral-800 hover:text-neutral-600 px-2 py-1 rounded-md"
              onClick={() => {
                setNewName(promptName);
                setIsRenameDialogOpen(true);
              }}
            >
              {promptName}
            </h1>
            {isSaving && <Badge>Saving...</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-neutral-50 text-neutral-600 shadow-lg">
            <>
              <Button
                variant="ghost"
                size="icon"
                className={`rounded-full ${isFavorite ? "text-red-300" : ""}`}
                onClick={() => {
                  handleUpdatePrompt({
                    isFavorite: !isFavorite,
                  });
                }}
              >
                <Heart
                  className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`}
                />
              </Button>
              <AIChat />
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 text-neutral-600">
                  <DropdownMenuItem
                    onClick={() => {
                      setNewName(promptName);
                      setIsRenameDialogOpen(true);
                    }}
                  >
                    <FileTextIcon className="mr-2 h-4 w-4" />
                    <span>Rename</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyToClipboard}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4"
                    >
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy Content</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-400 focus:bg-destructive/10 focus:text-destructive"
                    onClick={handleDeletePrompt}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Prompt</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
        </div>
      </div>
    )
}