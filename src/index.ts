import { program } from "commander";
import { parse_yaml_config, validate_config } from "./utils/parser";
import os from "node:os";
import { create_server } from "./server";

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