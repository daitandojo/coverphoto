import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SessionViewer from "./SessionViewer";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  const session = await prisma.portraitSessionRecord.findUnique({
    where: { id },
  });

  if (!session) {
    notFound();
  }

  const portraits = JSON.parse(session.portraits || "[]");

  return <SessionViewer id={id} portraits={portraits} />;
}
