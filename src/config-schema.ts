import { z } from 'zod';

const upstream_schema = z.object({
    id: z.string(),
    url: z.string().url(),
});

const header_schema = z.object({
    key: z.string(),
    value: z.string(),
});

const rule_schema = z.object({
    path: z.string(),
    upstreams: z.array(z.string()),
})

const server_schema = z.object({
    listen: z.number(),
    workers: z.number().optional(),
    upstreams: z.array(upstream_schema),
    headers: z.array(header_schema).optional(),
    rules: z.array(rule_schema),
});

export const root_config_schema = z.object({
    server: server_schema,
});