import { program } from "commander";
import { parse_yaml_config, validate_config } from "./parser";
import cluster from "node:cluster";
import os from "node:os"

interface CreateServerConfig {
    port: number,
    worker_count: number,
}

async function create_server(config: CreateServerConfig) {
    const { worker_count } = config;
    // const workers = new Array(worker_count);

    if (cluster.isPrimary) {
        console.log("Master Process Running 🚀!");
        // spinning up workers
        for (let i = 0; i < worker_count; i++) {
            cluster.fork()
            console.log(`Master Process: Worker Node Spinned Up ${i}`);
        }
    }
    else {
        console.log(`Worker Node 🚀`);
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
        await create_server({ port: validated_config.server.listen, worker_count: validated_config.server.workers ?? os.cpus().length })
    }
}

main();