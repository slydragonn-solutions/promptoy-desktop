import { createFileRoute } from '@tanstack/react-router';
import { useSettingsStore } from '@/store/settings-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/theme/mode-toggle';

// Simple toggle switch component since we don't have access to the Switch component
const ToggleSwitch = ({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    id={id}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${checked ? 'bg-primary' : 'bg-muted'}`}
  >
    <span
      className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-background transition-transform`}
    />
  </button>
);

export const Route = createFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const {
    theme,
    editor,
    list,
    filter,
    setTheme,
    updateEditor,
    updateList,
    updateFilter,
    resetToDefault
  } = useSettingsStore();

  return (
    <ScrollArea className="w-full h-[calc(100vh-37px)] bg-neutral-100 dark:bg-neutral-900">
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Button variant="outline" onClick={resetToDefault}>
          Reset to Defaults
        </Button>
      </div>
      {/* Appearance Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose between light and dark theme
                </p>
              </div>
              <div className="relative flex items-center gap-2">
                <ModeToggle />
              </div>
             
            </div>
          </CardContent>
        </Card>

        {/* Editor Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
            <CardDescription>Customize the code editor settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="font-size">Font Size</Label>
                <p className="text-sm text-muted-foreground">
                  Adjust the font size of the editor
                </p>
              </div>
              <Select
                value={editor.fontSize.toString()}
                onValueChange={(value) => updateEditor({ fontSize: parseInt(value) as 12 | 13 | 14 | 15 | 16 })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Font size" />
                </SelectTrigger>
                <SelectContent>
                  {[12, 13, 14, 15, 16].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="toolbar">Show Toolbar</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle the editor toolbar visibility
                </p>
              </div>
              <ToggleSwitch
                id="toolbar"
                checked={editor.showToolbar}
                onChange={(checked) => updateEditor({ showToolbar: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* List Settings */}
        <Card>
          <CardHeader>
            <CardTitle>List Settings</CardTitle>
            <CardDescription>Configure how prompts are displayed in the list</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="recent-prompts">Recent Prompts</Label>
                <p className="text-sm text-muted-foreground">
                  Number of recent prompts to show
                </p>
              </div>
              <Select
                value={list.numberOfRecentPrompts.toString()}
                onValueChange={(value) => updateList({ numberOfRecentPrompts: parseInt(value) as 3 | 5 | 10 })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Number of prompts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="list-open">Open On Start</Label>
                <p className="text-sm text-muted-foreground">
                  What to show when the app starts
                </p>
              </div>
              <Select
                value={list.listOpenOnStart}
                onValueChange={(value) => updateList({ listOpenOnStart: value as "none" | "all" | "groups" | "ungrouped" })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nothing</SelectItem>
                  <SelectItem value="all">All Prompts</SelectItem>
                  <SelectItem value="groups">Groups</SelectItem>
                  <SelectItem value="ungrouped">Ungrouped Prompts</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Filter Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Settings</CardTitle>
            <CardDescription>Configure how prompts are sorted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sort-by">Sort By</Label>
                <p className="text-sm text-muted-foreground">
                  Choose the default sort order
                </p>
              </div>
              <Select
                value={filter.sortBy}
                onValueChange={(value) => updateFilter({ sortBy: value as "a-z" | "z-a" | "newest" | "oldest" })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-z">A to Z</SelectItem>
                  <SelectItem value="z-a">Z to A</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        </div>
    </div>
    </ScrollArea>
  );
}