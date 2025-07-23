import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { promptsStore } from "@/store/prompts-store"
import { useTabs } from "@/hooks/use-tabs"
import NoteList from "../notes/note-list"
import VersionList from "../versions/version-list"
import { PromptContent } from "@/types/prompts"
import { GitCompare, Notebook } from "lucide-react"

interface EditorSidebarProps {
  onCompareVersion?: (version: PromptContent) => void;
  isComparing?: boolean;
}

export default function EditorSidebar({ onCompareVersion, isComparing = false }: EditorSidebarProps) {
    const { selectedPrompt } = promptsStore();
    
    // Tabs management
    const { activeTab, handleTabChange } = useTabs('versions');
    
    
    if (!selectedPrompt) {
        return (
            <section className="flex flex-col gap-2 min-w-80 w-80 h-[calc(100vh-37px)] p-2 border-l border-l-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
                <div className="flex items-center justify-center h-full text-muted-foreground">
                    <p>Select a prompt to view versions</p>
                </div>
            </section>
        );
    }
    
    return (
        <section className="flex flex-col gap-2 min-w-80 h-[calc(100vh-37px)] w-80 p-2 bg-neutral-100 dark:bg-neutral-900">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="self-end bg-indigo-50 p-0 gap-1 dark:bg-neutral-800">
                    <TabsTrigger value="versions" className=" text-neutral-600 bg-indigo-50 hover:bg-indigo-100 dark:text-neutral-200 dark:bg-neutral-800" title="Versions"><GitCompare className="w-4 h-4" /></TabsTrigger>
                    <TabsTrigger value="notes" className=" text-neutral-600 bg-indigo-50 hover:bg-indigo-100 dark:text-neutral-200 dark:bg-neutral-800" title="Notes"><Notebook className="w-4 h-4" /></TabsTrigger>
                </TabsList>
                <TabsContent value="versions">
                    <VersionList 
                      onCompareVersion={onCompareVersion}
                      isComparing={isComparing}
                    />
                </TabsContent>
                <TabsContent value="notes">
                    <NoteList />
                </TabsContent>
            </Tabs>
        </section>
    )
}