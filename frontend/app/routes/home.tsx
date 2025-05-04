import type { Route } from "./+types/home";
import Landing from "../components/Landing/Landing";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Calple" },
    { name: "description", content: "Calple" },
  ];
}

export default function Home() {
  return <Landing />;
}
