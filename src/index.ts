import { program } from "commander";
import { parse_yaml_config, validate_config } from "./parser";
import cluster from "node:cluster";
import os from "node:os";
import http from "node:http";
import { ConfigSchemaType, root_config_schema } from "./config-schema";

interface CreateServerConfig {
    port: number,
    worker_count: number,
    config: ConfigSchemaType,
}

async function create_server(config: CreateServerConfig) {
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

        })
    }
    else {
        console.log(`Worker Node 🚀!`);
        const config = await root_config_schema.parseAsync(JSON.parse(`${process.env.config}`));
    }
}

async function main() {
    program.option('--config <path>');
    program.parse();

    const options = program.opts();
    if (options && 'config' in options) {
        const validated_config = await validate_config(
            await parse_yaml_config(options.config)
        );
        // console.log(validated_config);
        await create_server({ port: validated_config.server.listen, worker_count: validated_config.server.workers ?? os.cpus().length, config: validated_config })
    }
}

main();