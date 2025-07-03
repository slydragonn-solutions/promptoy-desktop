import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/local")({
  component: Local,
})

function Local() {

  return (
    <div className="flex h-screen w-full items-center justify-center">
     Local
    </div>
  )
}