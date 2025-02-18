import { z } from "zod";

export const worker_message_schema = z.object({
    request_type: z.enum(['HTTP']),
    headers: z.any(),
    body: z.any(),
    url: z.string(),
});

export type WorkerMessageType = z.infer<typeof worker_message_schema>;