import { FileTextIcon } from "lucide-react";

export default function EditorNotFound() {
    return (
        <section className="relative flex flex-col items-center justify-center gap-4 w-[calc(100vw-320px-288px-48px)] h-[calc(100vh-37px)] p-2 text-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <FileTextIcon className="h-12 w-12 opacity-50" />
            <h2 className="text-xl font-medium">No Prompt Selected</h2>
            <div>
              <p className="text-sm mb-4">
                Select a prompt from the list or create a new one
              </p>
              <p className="text-sm text-indigo-500">Create a new prompt (⌘N)</p>
            </div>
          </div>
        </section>
      );
}