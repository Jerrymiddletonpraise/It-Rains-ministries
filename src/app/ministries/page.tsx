import type { Metadata } from "next";
import { getDepartments } from "@/lib/data";
import { PageHero, Section } from "@/components/ui";
import { DepartmentCard } from "@/components/cards";

export const metadata: Metadata = { title: "Ministry Departments" };
export const revalidate = 300;

export default async function Ministries() {
  const departments = await getDepartments();
  return (
    <>
      <PageHero eyebrow="Ministry departments" title="There's a place for you" intro="Discover where you can grow, belong and serve." />
      <Section><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{departments.map((d) => <DepartmentCard key={d.slug} d={d} />)}</div></Section>
    </>
  );
}
