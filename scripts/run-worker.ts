import { createWorkers } from "@/lib/jobs/workers";

const workers = createWorkers();
if (workers.length === 0) {
  console.log("Content Hunter AI worker is in dev fallback mode and does not need Redis.");
} else {
  console.log("Content Hunter AI workers started.");
}
