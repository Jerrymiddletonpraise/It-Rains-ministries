import { useParams } from "react-router-dom";
import { Construction } from "lucide-react";
import { SECTIONS } from "./ControlCenter";

/** Honest placeholder for Control Center areas scheduled in a later build phase. */
export default function Planned() {
  const { section } = useParams();
  const s = SECTIONS.find((x) => x.path === section);
  return (
    <div className="mx-auto max-w-2xl py-16 text-center">
      <Construction className="mx-auto h-10 w-10 text-gold" aria-hidden />
      <h1 className="mt-6 text-4xl">{s?.label ?? "Section"}</h1>
      <p className="mt-4 text-ivory-muted">This management area is scheduled for {s && "phase" in s ? `build phase ${s.phase}` : "a later build phase"}. Its database tables and security rules already exist, so it will plug straight in.</p>
    </div>
  );
}
