import { Queue } from "bullmq";
import { env } from "@/lib/utils/env";

type DevQueueJob = { name: string; data: unknown };

class DevQueue {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  async add(name: string, data: unknown) {
    const job: DevQueueJob = { name, data };
    console.log(`[dev-queue:${this.name}] queued`, job);
    return job;
  }
}

const useDevQueue = process.env.DEV_NO_DOCKER === "true" || !process.env.REDIS_URL;

const connection = useDevQueue ? null : { url: env.REDIS_URL };

export const ingestionQueue = useDevQueue ? new DevQueue("ingestion") : new Queue("ingestion", { connection: connection! });
export const analysisQueue = useDevQueue ? new DevQueue("analysis") : new Queue("analysis", { connection: connection! });
export const packetQueue = useDevQueue ? new DevQueue("packet") : new Queue("packet", { connection: connection! });
export const digestQueue = useDevQueue ? new DevQueue("digest") : new Queue("digest", { connection: connection! });
export const maintenanceQueue = useDevQueue ? new DevQueue("maintenance") : new Queue("maintenance", { connection: connection! });

export const queueConnection = connection;
export const queueMode = useDevQueue ? "memory" : "redis";
