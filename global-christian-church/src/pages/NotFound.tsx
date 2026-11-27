import { useSeo } from "@/lib/seo";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  useSeo("Page not found");
  return (
    <div className="container flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 text-6xl">This page could not be found</h1>
      <p className="mt-6 text-ivory-muted">The link may be broken or the page may have moved.</p>
      <ButtonLink to="/" className="mt-10">Return home</ButtonLink>
    </div>
  );
}
