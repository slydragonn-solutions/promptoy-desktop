import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute("/info")({
  component: Info,
})

function Info() {

  return (
    <div className="flex h-screen w-full items-center justify-center">
     Info
    </div>
  )
}