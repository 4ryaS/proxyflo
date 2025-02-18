import cluster, { Worker } from "node:cluster";
import http from "node:http";
import { ConfigSchemaType, root_config_schema } from "./schema/config-schema";
import { worker_message_schema, WorkerMessageType } from "./schema/server-schema";

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
        });
    }
}