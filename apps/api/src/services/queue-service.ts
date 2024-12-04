import { Queue } from "bullmq";
import { logger } from "../lib/logger";
import IORedis from "ioredis";

let scrapeQueue: Queue;

export const redisConnection = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

export const scrapeQueueName = "{scrapeQueue}";

const QUEUE_COMPLETE_AGE = Number(process.env.QUEUE_COMPLETE_AGE || 90000);  // 默认25小时
const QUEUE_FAIL_AGE = Number(process.env.QUEUE_FAIL_AGE || 90000);         // 默认25小时

export function getScrapeQueue() {
  if (!scrapeQueue) {
    scrapeQueue = new Queue(
      scrapeQueueName,
      {
        connection: redisConnection,
        defaultJobOptions: {
          removeOnComplete: {
            age: QUEUE_COMPLETE_AGE,
          },
          removeOnFail: {
            age: QUEUE_FAIL_AGE,
          },
        },
      }
    );
    logger.info("Web scraper queue created");
  }
  return scrapeQueue;
}


// === REMOVED IN FAVOR OF POLLING -- NOT RELIABLE
// import { QueueEvents } from 'bullmq';
// export const scrapeQueueEvents = new QueueEvents(scrapeQueueName, { connection: redisConnection.duplicate() });