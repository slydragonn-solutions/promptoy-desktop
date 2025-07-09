import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from "react";
import { useTagsStore } from "@/store/tags-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TagsIcon, Trash2 } from "lucide-react";
import { getTagColorClasses } from '@/constants/tags';
import { promptsStore } from '@/store/prompts-store';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Route = createFileRoute("/tags")({
  component: Tags,
})

function Tags() {
  const navigate = useNavigate({from: "/tags"})
  const { tags, isLoading, addTag, removeTag, loadTags } = useTagsStore();
  const { setSelectedPrompt } = promptsStore();
  const [newTagName, setNewTagName] = useState("");



  useEffect(() => {
    // Load tags from storage on component mount
    loadTags();
  }, []);

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const newTag = addTag(newTagName);

    if (newTag) {
      setNewTagName("");
    }

  };

  const handleDeleteTag = (tagId: string) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      removeTag(tagId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full h-screen p-4">
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <Input
            placeholder="Enter tag name..."
            className='rounded-full'
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <Button onClick={handleAddTag} className='rounded-full' disabled={!newTagName.trim()}><TagsIcon />Add Tag</Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-100px)]">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag) => {
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
              <Button
                variant="ghost"
                size="icon"
                className='hover:bg-red-200 text-neutral-600'
                onClick={() => handleDeleteTag(tag.id)}
              >
                <Trash2 />
              </Button>
            </CardHeader>
            <CardContent className="flex flex-col">
              <h3 className="text-xs mb-2">Associated Prompts ({tag.prompts?.length})</h3>
              {tag.prompts && tag.prompts.length > 0 ? (
                  <ScrollArea className="overflow-y-auto h-[80px]">
                    {tag.prompts.map((prompt) => (
                      <div
                        key={prompt.id}
                        className="flex flex-row items-center justify-between text-xs hover:bg-neutral-200 cursor-pointer bg-neutral-50 p-2 rounded-md mb-2"
                        onClick={() => {
                          setSelectedPrompt(prompt.id);
                          navigate({to: "/all"})
                        }}
                      >
                        <span className="text-neutral-700">{prompt.name}</span>
                        <span className="text-neutral-400">{new Date(prompt.createdAt).toLocaleDateString()}</span>
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
        )})}
      </div>
      </ScrollArea>
    </div>
  );
}