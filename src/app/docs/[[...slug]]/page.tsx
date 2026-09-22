"use client";

import { useParams } from "next/navigation";
import { DocsArticle } from "../DocsSite";

export default function DocsPage() {
  const params = useParams<{ slug?: string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : "";
  return <DocsArticle slug={slug} />;
}
