"use client";

import { useParams } from "next/navigation";
import { DocsFrame } from "@/components/DocsFrame";

export default function DocsPage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : "";
  return <DocsFrame slug={slug} />;
}
