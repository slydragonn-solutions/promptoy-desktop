import { useVersionComparison } from "@/hooks/use-version-comparison";
import Editor from "@/components/editor/editor";
import Sidebar from "@/components/editor/sidebar";
import PromptList from "@/components/prompts/prompt-list";

interface EditorLayoutProps {
    listBy: "all" | "favorites" | "local" | "backup";
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
            <Sidebar 
                onCompareVersion={versionComparison.handleCompareVersion}
                isComparing={versionComparison.isComparing}
            />
        </>
    )
}
    