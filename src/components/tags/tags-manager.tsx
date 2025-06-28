import { useState, useEffect } from 'react';
import { Tag as TagIcon, Edit2, Trash2, Search } from 'lucide-react';
import { useTagsStore } from '@/store/tags-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tag } from './tag';

export function TagsManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<{ id: string; name: string } | null>(null);
  const [tagName, setTagName] = useState('');
  
  const { 
    tags, 
    addTag, 
    updateTag, 
    removeTag,
    loadTags 
  } = useTagsStore();
  
  // Load tags when the component mounts
  useEffect(() => {
    loadTags();
  }, [loadTags]);
  
  // Filter tags based on search query
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleAddTag = () => {
    const trimmedName = tagName.trim();
    if (!trimmedName) return;
    
    addTag(trimmedName);
    setTagName('');
  };
  
  const handleUpdateTag = () => {
    if (!editingTag || !tagName.trim()) return;
    
    updateTag(editingTag.id, { name: tagName.trim() });
    setEditingTag(null);
    setTagName('');
  };
  
  const handleEditClick = (tag: { id: string; name: string }) => {
    setEditingTag(tag);
    setTagName(tag.name);
  };
  
  const handleDeleteTag = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag? This will remove it from all prompts.')) {
      removeTag(tagId);
    }
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <TagIcon className="h-4 w-4" />
        Manage Tags
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create, edit, and manage your tags. Tags help you organize and find your prompts easily.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tags..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="New tag name..."
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      editingTag ? handleUpdateTag() : handleAddTag();
                    }
                  }}
                />
                <Button 
                  onClick={editingTag ? handleUpdateTag : handleAddTag}
                  disabled={!tagName.trim()}
                >
                  {editingTag ? 'Update' : 'Add'}
                </Button>
                {editingTag && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingTag(null);
                      setTagName('');
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
            
            <div className="border rounded-md">
              {filteredTags.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchQuery ? 'No matching tags found' : 'No tags yet. Create your first tag!'}
                </div>
              ) : (
                <ul className="divide-y">
                  {filteredTags.map((tag) => (
                    <li key={tag.id} className="flex items-center justify-between p-3 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <Tag name={tag.name} color={tag.color} />
                        <span className="text-sm">
                          {tag.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditClick(tag)}
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTag(tag.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
