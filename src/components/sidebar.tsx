import { EllipsisIcon, HistoryIcon, NotebookPenIcon, TrashIcon } from "lucide-react"
import { Button } from "./ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { ScrollArea } from "./ui/scroll-area"

interface NoteItemProps {
    id: string;
    content: string;
    createdAt: string;
}

function NoteItem({ id, content, createdAt }: NoteItemProps) {
    return (
        <li className="flex flex-col gap-2 py-2 px-4 border border-neutral-200 rounded-md bg-neutral-50">
            <div className="flex justify-between gap-2">
                <p className="text-xs text-neutral-500">{createdAt}</p>
                <TrashIcon className="cursor-pointer w-4 h-4 text-neutral-400 hover:text-red-500"/>
            </div>
            <p className="text-sm">{content}</p>
        </li>
    )
}

export default function Sidebar() {
    return (
        <section className="flex flex-col gap-2 min-w-80 w-80 h-screen p-2 border-l border-l-neutral-200 bg-neutral-200">
            <Tabs defaultValue="versions" className="w-full">
                <TabsList className="w-full">
                    <TabsTrigger value="versions">Versions</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                </TabsList>
                <TabsContent value="versions">
                    <Button variant="secondary" className="w-full"><HistoryIcon /> New Version</Button>
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        <ul className="flex flex-col gap-2 mt-4">
                            <li className="flex justify-between items-center gap-2 py-2 px-4 border border-neutral-200 rounded-md bg-neutral-50">
                                <p className="text-xs ">{new Date().toLocaleString()}</p>
                                <EllipsisIcon className="cursor-pointer w-4 h-4 text-neutral-400 hover:text-neutral-600"/>
                            </li>
                        </ul>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="notes">
                    <Button variant="secondary" className="w-full"><NotebookPenIcon /> New Note</Button>
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        <ul className="flex flex-col gap-2 mt-4">
                            <NoteItem id="1" content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                            <NoteItem id="2" content="Lorem ipsum dolor sit amet consectetur" createdAt="2025-06-23"/>
                            <NoteItem id="3" content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                            <NoteItem id="4" content="Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis voluptatum rem corporis eius, ullam recusandae. Repellat unde ea dolore sit iste quo in asperiores, quae esse aut, voluptatum illum aliquid?" createdAt="2025-06-23"/>
                        </ul>
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="chat">Chat content</TabsContent>
            </Tabs>
        </section>
    )
}