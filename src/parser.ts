import fs from 'node:fs/promises';
import { parse } from 'yaml';

async function parse_yaml_config(file_path: string) {
    const config_file_content = await fs.readFile(file_path, 'utf8');
    const config_parsed = parse(config_file_content);
    return JSON.stringify(config_parsed);
}
