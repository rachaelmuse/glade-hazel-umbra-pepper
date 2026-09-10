import { createFileRoute } from "@tanstack/react-router";
import { SignalConsole } from "@/components/signal/console";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return <SignalConsole />;
}
