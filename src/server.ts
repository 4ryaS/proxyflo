import cluster, { Worker } from "node:cluster";
import http from "node:http";
import { ConfigSchemaType, root_config_schema } from "./schema/config-schema";
import { worker_message_schema, WorkerMessageType, WorkerMessageResponseType, worker_message_response_schema } from "./schema/server-schema";

interface CreateServerConfig {
    port: number,
    worker_count: number,
    config: ConfigSchemaType,
}

export async function create_server(config: CreateServerConfig) {
    const { worker_count, port } = config;
    // const workers = new Array(worker_count);
    const WORKER_POOL: Worker[] = [];

    if (cluster.isPrimary) {
        console.log("Master Process Running 🚀!");
        // spinning up workers
        for (let i = 0; i < worker_count; i++) {
            const worker = cluster.fork({ config: JSON.stringify(config.config) });
            WORKER_POOL.push(worker);
            console.log(`Master Process: Worker Node ${i} Spinned Up`);
        }
        
        const server = http.createServer((req, res) => {
            const index = Math.floor(Math.random() * WORKER_POOL.length);
            const worker = WORKER_POOL.at(index);
            
            if (!worker) throw new Error("Worker not found!");

            const payload: WorkerMessageType = {
                request_type: 'HTTP',
                headers: req.headers,
                body: null,
                url: `${req.url}`
            };
            
            // send a message to the worker
            worker.send(JSON.stringify(payload));

            worker.on('message', async (worker_response: string) => {
                const response = await worker_message_response_schema.parseAsync(JSON.parse(worker_response));
                if (response.error_code) {
                    res.writeHead(parseInt(response.error_code));
                    res.end(response.error);
                    return;
                }
                else {
                    res.writeHead(200);
                    res.end(response.data);
                    return;
                }
            });
        });

        server.listen(port, () => {
            console.log(`Proxyflo Server 🎐 Listening On Port: ${port}`);
        });
    }
    else {
        console.log(`Worker Node 🚀!`);
        const config = await root_config_schema.parseAsync(JSON.parse(`${process.env.config}`));
        
        process.on('message', async (message: string) => {
            // console.log("Worker: ", message);
            const validated_message = await worker_message_schema.parseAsync(JSON.parse(message));
            const request_url = validated_message.url;
            const rule = config.server.rules.find(rule => rule.path === request_url);

            if (!rule) {
                const response: WorkerMessageResponseType = { error: "Rule not found!", error_code: '404' };
                if (process.send) return (JSON.stringify(response));
            }

            const upstream_id = rule?.upstreams[0];
            const upstream = config.server.upstreams.find(upstream => upstream.id === upstream_id);

            if (!upstream) {
                const response: WorkerMessageResponseType = { error: "Upstream not found!", error_code: '500' };
                if (process.send) return (JSON.stringify(response));
            }

            const request = http.request({ host: upstream?.url, path: request_url }, (proxy_response) => {
                let body = '';
                proxy_response.on('data', (chunk) => {
                    body += chunk;
                });

                proxy_response.on('end', () => {
                    const response: WorkerMessageResponseType = { data: body };
                    if (process.send) return (JSON.stringify(response));
                });

                request.end();
            });

        });
    }
}