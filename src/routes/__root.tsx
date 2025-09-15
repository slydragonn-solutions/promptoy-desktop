import {
  createRootRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  HouseIcon,
  InfoIcon,
  SettingsIcon,
  BookText,
  Tags,
} from "lucide-react";
import { useEffect } from "react";
import { promptsStore } from "@/store/prompts-store";
import { Toaster } from "@/components/ui/sonner";
import TitleBar from "@/components/layout/title-bar";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button"
import { WelcomeDialog } from "@/components/common/welcome-dialog";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"

const InfoDialog = ({trigger}: {trigger: React.ReactNode}) => {
  const appVersion = __APP_VERSION__;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
          <div className="w-full max-w-2xl text-center">
        <div className="flex flex-col items-center">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-xl bg-white p-1 shadow-sm dark:bg-neutral-800">
              <img 
                src="/promptoy-logo-512.png" 
                alt="Promptoy Logo" 
                className="h-24 w-24 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-neutral-200">Promptoy</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-400">Version {appVersion}</p>
          </div>
          
          <div className="w-full space-y-8">
            <section className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">About</h2>
              <p className="mx-auto max-w-lg text-gray-600 dark:text-neutral-400">
                Promptoy is a desktop application designed to help you manage and organize your AI prompts efficiently. 
                Create, save, and organize your prompts in one place for easy access.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">Connect With Us</h2>
                  <a
                    href="https://promptoy.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline dark:text-orange-400"
                  >
                    https://promptoy.com
                  </a>
            </section>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  )
}

export const Route = createRootRoute({
  component: () => {
    const router = useRouterState();
    const currentPath = router.location.pathname;
    const { setSelectedPrompt } = promptsStore();

    useEffect(() => {

      if (currentPath !== "/vault") {
        setSelectedPrompt(null);
      }
    }, [currentPath]);

    return (
      <ThemeProvider defaultTheme="light">
        <TitleBar />
        <main className="flex h-[calc(100vh-37px)] items-center justify-center">
          <WelcomeDialog />
          <nav className="flex flex-col h-full items-center justify-between gap-2 p-2 bg-neutral-100 text-neutral-500 border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/" ? "text-neutral-900 dark:text-neutral-200" : ""}`}
                    title="Home"
                  >
                    <HouseIcon />
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/vault">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/vault" ? "text-neutral-900 dark:text-neutral-200" : ""}`}
                    title="Vault"
                  >
                    <BookText />
                  </Button>
                </Link>
              </li>
              <li>
                <Link to="/tags">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/tags" ? "text-neutral-900 dark:text-neutral-200" : ""}`}
                    title="Tags"
                  >
                    <Tags />
                  </Button>
                </Link>
              </li>
            </ul>
            <ul className="flex flex-col gap-2">
              <li>
                <Link to="/settings">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/settings" ? "text-neutral-900 dark:text-neutral-200" : ""}`}
                    title="Settings"
                  >
                    <SettingsIcon />
                  </Button>
                </Link>
              </li>
              <li>
                <InfoDialog trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${currentPath === "/info" ? "text-neutral-900 dark:text-neutral-200" : ""}`}
                    title="Info"
                  >
                    <InfoIcon />
                  </Button>
                }/>
              </li>
            </ul>
          </nav>
          <Outlet />
          <TanStackRouterDevtools position="top-left" />
          <Toaster />
        </main>
      </ThemeProvider>
    );
  },
});
