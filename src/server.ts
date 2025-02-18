import cluster, { Worker } from "node:cluster";
import http from "node:http";
import { ConfigSchemaType, root_config_schema } from "./schema/config-schema";

interface CreateServerConfig {
    port: number,
    worker_count: number,
    config: ConfigSchemaType,
}

export async function create_server(config: CreateServerConfig) {
    const { worker_count } = config;
    // const workers = new Array(worker_count);

    if (cluster.isPrimary) {
        console.log("Master Process Running 🚀!");
        // spinning up workers
        for (let i = 0; i < worker_count; i++) {
            cluster.fork({ config: JSON.stringify(config.config) })
            console.log(`Master Process: Worker Node ${i} Spinned Up`);
        }
        
        const server = http.createServer((req, res) => {
            const index = Math.floor(Math.random() * worker_count);
            const worker: Worker = Object.values(!cluster.workers)[index];

            // send a message to the worker
            worker.send({
                request_type: 'http',
                headers: '',
                body: '',
                path: '',
            });
        });
    }
    else {
        console.log(`Worker Node 🚀!`);
        const config = await root_config_schema.parseAsync(JSON.parse(`${process.env.config}`));
    }
}