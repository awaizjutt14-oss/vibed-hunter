import { Worker } from "bullmq";
import { queueConnection, queueMode } from "@/lib/jobs/queues";
import { generatePacketForCluster } from "@/lib/ai/generate-packet";
import { runIngestion } from "@/lib/ingestion/service";
import { rebuildTrendClusters } from "@/lib/trends/service";

export function createWorkers() {
  if (queueMode === "memory" || !queueConnection) {
    console.log("Running in no-Docker dev mode. Redis/BullMQ workers are disabled.");
    return [];
  }

  const workers = [
    new Worker("ingestion", async () => runIngestion(), { connection: queueConnection! }),
    new Worker("analysis", async () => rebuildTrendClusters(), { connection: queueConnection! }),
    new Worker(
      "packet",
      async (job) => generatePacketForCluster(job.data.clusterId as string, job.data.userId as string),
      { connection: queueConnection! }
    )
  ];

  return workers;
}
