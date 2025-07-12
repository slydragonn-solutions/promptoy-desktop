import { Editor as MonacoEditor } from "@monaco-editor/react";
import { Button } from "../ui/button";
import { Tags } from "lucide-react";
import { TagSelector } from "../tags/tag-selector";
import { useEditor } from "@/hooks/use-editor";
import { promptsStore } from "@/store/prompts-store";
import { MarkdownToolbar } from "./markdown-toolbar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import EditorFooter from "./editor-footer";
import EditorNotFound from "./editor-not-found";
import EditorHeader from "./editor-header";
import { DiffEditor } from "./diff-editor";
interface EditorProps {
  isComparing: boolean;
  compareVersion: {
    content: string;
    date: string;
    name?: string;
  } | null;
  onCloseCompare: () => void;
}

export default function Editor({ isComparing, compareVersion, onCloseCompare }: EditorProps) {
  const { selectedPrompt } = promptsStore();
  
  // Get the current version (most recent one)
  const currentVersion = selectedPrompt?.versions?.[0];
  
  const {
    content,
    isSaving,
    isRenameDialogOpen,
    newName,
    editorRef,
    setNewName,
    setIsRenameDialogOpen,
    handleEditorChange,
    handleEditorDidMount,
    handleUpdatePrompt,
    handleRename,
    handleKeyDown,
    handleCopyToClipboard,
    handleDeletePrompt,
  } = useEditor(selectedPrompt);


  if (!selectedPrompt) {
    return <EditorNotFound />;
  }

  return (
    <section className="relative flex flex-col gap-2 w-[calc(100vw-320px-288px-48px)] h-screen p-2">
      {/* Header */}
      <EditorHeader
        selectedPrompt={selectedPrompt}
        isSaving={isSaving}
        currentGroupId={selectedPrompt.group || null}
        setIsRenameDialogOpen={setIsRenameDialogOpen}
        setNewName={setNewName}
        handleUpdatePrompt={handleUpdatePrompt}
        handleCopyToClipboard={handleCopyToClipboard}
        handleDeletePrompt={handleDeletePrompt}
      />

      {/* Tags */}
      <div className="flex items-center gap-2">
        <TagSelector
          value={selectedPrompt.tags || []}
          onChange={(tags) => {
            // Create a new object to trigger the update
            const updatedPrompt = { ...selectedPrompt, tags };
            handleUpdatePrompt(updatedPrompt);
          }}
          className="flex flex-wrap gap-1"
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground hover:text-foreground rounded-full"
            >
              <Tags className="h-4 w-4 mr-1" />
              {selectedPrompt.tags?.length
                ? `${selectedPrompt.tags.length} tags`
                : "Add tags"}
            </Button>
          }
          selectedPrompt={selectedPrompt}
        />
      </div>

      {/* Editor */}
      <div className="relative h-full">
        {!isComparing && (
          <MarkdownToolbar 
            editorRef={editorRef} 
            onCopy={handleCopyToClipboard} 
          />
        )}
        {isComparing && compareVersion ? (
          <div className="h-full border rounded-md overflow-hidden">
            <DiffEditor
              original={compareVersion.content}
              modified={content}
              originalTitle={`${compareVersion.name || 'Version'} (${new Date(compareVersion.date).toLocaleString()})`}
              modifiedTitle={`${currentVersion?.name || 'Current Version'} (${new Date(currentVersion?.date || selectedPrompt?.updatedAt).toLocaleString()})`}
              onClose={onCloseCompare}
            />
          </div>
        ) : (
          <MonacoEditor
            height="calc(100vh - 200px)"
            defaultLanguage="markdown"
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              wordWrap: "on",
              automaticLayout: true,
              padding: { top: 16 },
            }}
          />
        )}
      </div>

      {/* Footer */}
      <EditorFooter selectedPrompt={selectedPrompt} content={content} />



      {/* Rename Prompt Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Prompt</DialogTitle>
            <DialogDescription>
              Enter a new name for your prompt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="relative">
              <div className="relative">
                <Input
                  type="text"
                  value={newName}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setNewName(e.target.value);
                    }
                  }}
                  onKeyDown={handleKeyDown}
                  className="w-full pr-16"
                  autoFocus
                  placeholder="Enter prompt name"
                  maxLength={50}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {newName.length}/50
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsRenameDialogOpen(false);
                setNewName("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newName.trim() || newName.trim().length > 50}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

