import { createFileRoute } from '@tanstack/react-router';
import { Github, Twitter, Mail, Globe } from 'lucide-react';

export const Route = createFileRoute("/info")({
  component: Info,
});

function Info() {
  const appVersion = __APP_VERSION__; // This will be replaced by Vite during build
  
  const links = [
    {
      name: 'GitHub',
      url: 'https://github.com/yourusername/promptoy-desktop',
      icon: <Github className="h-5 w-5" />,
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/yourhandle',
      icon: <Twitter className="h-5 w-5" />,
    },
    {
      name: 'Website',
      url: 'https://yourwebsite.com',
      icon: <Globe className="h-5 w-5" />,
    },
    {
      name: 'Contact',
      url: 'mailto:contact@yourdomain.com',
      icon: <Mail className="h-5 w-5" />,
    },
  ];

  return (
    <div className="flex h-[calc(100vh-37px)] w-full items-center justify-center bg-neutral-100 p-6 dark:bg-neutral-900">
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
    </div>
  );
}