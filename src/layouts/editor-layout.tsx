import { useVersionComparison } from "@/hooks/use-version-comparison";
import Editor from "@/components/editor/editor";
import EditorSidebar from "@/components/editor/editor-sidebar";
import PromptList from "@/components/prompts/prompt-list";

interface EditorLayoutProps {
    listBy: "all" | "backup";
    title: string;
}

export default function EditorLayout({ listBy, title }: EditorLayoutProps) {
    const versionComparison = useVersionComparison();

    return (
        <>
            <PromptList listBy={listBy} title={title}/>
            <Editor 
                isComparing={versionComparison.isComparing}
                compareVersion={versionComparison.compareVersion}
                onCloseCompare={versionComparison.handleCloseCompare}
            />
            <EditorSidebar 
                onCompareVersion={versionComparison.handleCompareVersion}
                isComparing={versionComparison.isComparing}
            />
        </>
    )
}
    
