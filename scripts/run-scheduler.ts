import { analysisQueue, digestQueue, ingestionQueue, maintenanceQueue } from "@/lib/jobs/queues";
import { queueMode } from "@/lib/jobs/queues";
import { runIngestion } from "@/lib/ingestion/service";
import { rebuildTrendClusters } from "@/lib/trends/service";

async function main() {
  if (queueMode === "memory") {
    await runIngestion();
    await rebuildTrendClusters();
    console.log("Ran scheduler tasks directly in no-Docker dev mode.");
    process.exit(0);
  }

  await ingestionQueue.add("sync-sources", {});
  await analysisQueue.add("rebuild-clusters", {});
  await digestQueue.add("daily-digest", {});
  await maintenanceQueue.add("cleanup", {});
  console.log("Scheduled base jobs.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
