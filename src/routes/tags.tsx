import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, Pen, TagsIcon, Trash2 } from "lucide-react";
import { getTagColorClasses } from '@/constants/tags';
import { promptsStore } from '@/store/prompts-store';
import { ScrollArea } from '@/components/ui/scroll-area';
import useTagsManagement from '@/hooks/use-tags-management';
import { useTagsStore } from '@/store/tags-store';
import TagEditForm from '@/components/tags/tag-edit-form';
import Alert from '@/components/common/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const Route = createFileRoute("/tags")({
  component: Tags,
})

function Tags() {
  const navigate = useNavigate({from: "/tags"})
  const { prompts, setSelectedPrompt, selectedPrompt, updatePrompt, getPrompts, isLoading } = promptsStore();
  const { tags } = useTagsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    getPrompts();
  }, [getPrompts]);
  
  // Filter tags based on search query
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Check if we should show the no results message
  const showNoResults = searchQuery && filteredTags.length === 0;

  const {
    newTagName,
    editingTagId,
    selectedColor,
    deletingTagId,
    editedTagName,
    createTag,
    startEdit,
    cancelEdit,
    saveEdit,
    deleteTag,
    setNewTagName,
    setEditedTagName,
    setSelectedColor,
    setDeletingTagId
  } = useTagsManagement([], (tags) => {
    // Create a new object to trigger the update
    const updatedPrompt = { ...selectedPrompt, tags };
    if(selectedPrompt?.id){
      updatePrompt(selectedPrompt.id, updatedPrompt);
    }
  })


  if (tags.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] w-full">
        <p className="text-center text-muted-foreground">No tags found</p>
      </div>
    );
  }

  if(isLoading){
    return (
      <div className="flex items-center justify-center min-h-[200px] w-full">
        <p className="text-center text-muted-foreground">Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-screen p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search tags..."
            className="rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            onClick={() => setIsCommandOpen(true)} 
            className="rounded-full"
            variant="outline"
          >
            <TagsIcon className="mr-2 h-4 w-4" />
            New Tag
          </Button>
        </div>

        <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
          <Command>
            <CommandInput 
              placeholder="Type a new tag name..."
              value={newTagName}
              onValueChange={setNewTagName}
            />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    if (newTagName.trim()) {
                      createTag();
                      setIsCommandOpen(false);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {newTagName}
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </CommandDialog>
      </div>

      {
        editingTagId && (
          <TagEditForm
            editedTagName={editedTagName}
            setEditedTagName={setEditedTagName}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            setDeletingTagId={setDeletingTagId}
            editingTagId={editingTagId}
          />
        )
      }

      <div className="h-full">
        <ScrollArea className="h-[calc(100vh-100px)]">
          <Tabs defaultValue="grid">
            <TabsList>
              <TabsTrigger value="grid"><LayoutGrid /></TabsTrigger>
              <TabsTrigger value="list"><List /></TabsTrigger>
            </TabsList>
            <TabsContent value="grid">
              {showNoResults && (
                <div className="text-center py-8 text-muted-foreground">
                  No tags found matching "{searchQuery}"
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTags.map((tag) => {
                  const colorClasses = getTagColorClasses(tag.color);

                  return (
                    <Card key={tag.id} className={`${colorClasses}`}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          <Badge
                            variant="outline"
                            className={`${colorClasses} rounded-full text-sm`}
                          >
                            {tag.name}
                          </Badge>
                        </CardTitle>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className='hover:bg-neutral-200 text-neutral-600'
                            onClick={() => {
                              startEdit(tag.id, tag.name, tag.color);
                            }}
                          >
                            <Pen />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className='hover:bg-red-200 text-neutral-600'
                            onClick={() => {
                              setDeletingTagId(tag.id);
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="flex flex-col">
                        <h3 className="text-xs mb-2">Associated Prompts ({tag.prompts?.length})</h3>
                        {tag.prompts && tag.prompts.length > 0 ? (
                          <ScrollArea className="overflow-y-auto h-[100px]">
                            {tag.prompts.map((promptId) => (
                              <div
                                key={promptId}
                                className="flex flex-row items-center justify-between text-xs hover:bg-neutral-200 cursor-pointer bg-neutral-50 p-2 rounded-md mb-2"
                                onClick={() => {
                                  setSelectedPrompt(promptId);
                                  navigate({to: "/all"});
                                }}
                              >
                                <span className="text-neutral-700">{prompts.find(p => p.id === promptId)?.name}</span>
                                <span className="text-neutral-400">{new Date(prompts.find(p => p.id === promptId)?.createdAt || '').toLocaleDateString()}</span>
                              </div>
                            ))}
                          </ScrollArea>
                        ) : (
                          <p className="text-xs text-muted-foreground">No prompts associated with this tag</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Created: {new Date(tag.createdAt).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="list">
              <Accordion type="single" collapsible className="w-full">
                {filteredTags.map((tag) => (
                  <AccordionItem value={tag.id} key={tag.id}>
                    <AccordionTrigger className={`flex items-center justify-between w-full ${getTagColorClasses(tag.color)} my-2 p-2`}>
                      <Badge
                        variant="outline"
                        className={`${getTagColorClasses(tag.color)} rounded-full text-sm`}
                      >
                        {tag.name}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent className={`flex flex-col ${getTagColorClasses(tag.color)} mb-2 p-2 rounded-md`}>
                      <div className="flex items-center mb-2 justify-between">
                        <div className="text-xs text-muted-foreground">
                          Created: {new Date(tag.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className='hover:bg-neutral-200 text-neutral-600'
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(tag.id, tag.name, tag.color);
                            }}
                          >
                            <Pen />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className='hover:bg-red-200 text-neutral-600'
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingTagId(tag.id);
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs mb-2">Associated Prompts ({tag.prompts?.length})</p>
                      {tag.prompts && tag.prompts.length > 0 ? (
                        <div>
                          {tag.prompts.map((promptId) => (
                            <div
                              key={promptId}
                              className="flex flex-row items-center justify-between text-xs hover:bg-neutral-200 cursor-pointer bg-neutral-50 p-2 rounded-md mb-2"
                              onClick={() => {
                                setSelectedPrompt(promptId);
                                navigate({to: "/all"});
                              }}
                            >
                              <span className="text-neutral-700">{prompts.find(p => p.id === promptId)?.name}</span>
                              <span className="text-neutral-400">{new Date(prompts.find(p => p.id === promptId)?.createdAt || '').toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No prompts associated with this tag</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </div>
      <Alert
        open={!!deletingTagId}
        onOpenChange={(open: boolean) => !open && setDeletingTagId(null)}
        onAction={deleteTag}
        title="Delete Tag"
        description="Are you sure you want to delete this tag? This action cannot be undone."
        actionText="Delete"
      />
    </div>
  );
}