import { Prompt } from "@/types/prompts";
import { MAX_CONTENT_LENGTH } from "@/constants/prompt";

interface EditorFooterProps {
    selectedPrompt: Prompt | null;
    content: string;
}

export default function EditorFooter({ selectedPrompt, content }: EditorFooterProps) {

    const getFormattedDate = (dateString: string) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString();
    };
    
    return (
        <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center gap-2 p-2 rounded-md text-xs text-muted-foreground bg-neutral-50 dark:bg-neutral-800">
        <div className="flex items-center gap-4">
          <span className="hidden xl:block">
            Created:{" "}
            {selectedPrompt
              ? getFormattedDate(selectedPrompt.createdAt)
              : "N/A"}
          </span>
          <span className="hidden md:block">
            Updated:{" "}
            {selectedPrompt
              ? getFormattedDate(selectedPrompt.updatedAt)
              : "N/A"}
          </span>
        </div>
        <span>
          {content?.length}/{MAX_CONTENT_LENGTH}
        </span>
      </div>
    )
}