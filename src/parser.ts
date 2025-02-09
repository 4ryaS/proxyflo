import fs from 'node:fs/promises';
import { parse } from 'yaml';
import { root_config_schema } from './config-schema';

export async function parse_yaml_config(file_path: string) {
    const config_file_content = await fs.readFile(file_path, 'utf8');
    const config_parsed = parse(config_file_content);
    return JSON.stringify(config_parsed);
}

export async function validate_config(config: string) {
    const validated_config = await root_config_schema.parseAsync(JSON.parse(config));
    return validated_config;
}