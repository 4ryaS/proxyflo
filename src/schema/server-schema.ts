import { z } from "zod";

export const worker_message_schema = z.object({
    request_type: z.enum(['HTTP']),
    headers: z.any(),
    body: z.any(),
    url: z.string(),
});

export const worker_message_response_schema = z.object({
    data: z.string().optional(),
    error: z.string().optional(),
    error_code: z.enum(['500', '404']).optional(),
});

export type WorkerMessageType = z.infer<typeof worker_message_schema>;
export type WorkerMessageResponseType = z.infer<typeof worker_message_response_schema>;