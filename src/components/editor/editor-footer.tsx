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
        <div className="absolute bottom-2 left-0 right-0 flex justify-between items-center gap-2 p-2 rounded-xl text-xs text-muted-foreground bg-neutral-50">
        <div className="flex items-center gap-4">
          <span>
            Created:{" "}
            {selectedPrompt
              ? getFormattedDate(selectedPrompt.createdAt)
              : "N/A"}
          </span>
          <span>
            Updated:{" "}
            {selectedPrompt
              ? getFormattedDate(selectedPrompt.updatedAt)
              : "N/A"}
          </span>
        </div>
        <span>
          Characters: {content?.length.toLocaleString()}/
          {MAX_CONTENT_LENGTH.toLocaleString()}
        </span>
      </div>
    )
}