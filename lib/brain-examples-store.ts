import { prisma } from "@/lib/db/prisma";
import type { BrainExample } from "@prisma/client";

export type BrainExampleType = "great-post" | "bad-post" | "hook-good" | "hook-bad" | "caption-good" | "caption-bad";

export async function addBrainExample(input: { type: BrainExampleType; text: string; quality: "good" | "bad"; notes?: string }) {
  await prisma.brainExample.create({
    data: {
      type: input.type,
      text: input.text,
      quality: input.quality,
      notes: input.notes
    }
  });
}

export async function listBrainExamples(): Promise<BrainExample[]> {
  return prisma.brainExample.findMany({ orderBy: { createdAt: "desc" } });
}
