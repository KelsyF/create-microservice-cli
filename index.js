#!/user/bin/env node

// CLI entrypoint

import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

// Support __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("CLI starting...");
    
    // Check for flags
    const args = process.argv.slice(2);
    const validFlags = ['--help', '--force'];

    let showHelp = args.includes('--help');
    const forceFlag = args.includes('--force');

    const unknownFlag = args.filter(arg => arg.startsWith('--') && !validFlags.includes(arg));

    if (unknownFlag.length > 0) {
        console.log(`There was an unknown flag: ${unknownFlag.join(', ')}`);
        showHelp = true;
    }

    if (showHelp) {
        console.log(`
    create-mciroservice

    Usage:
        node index.js [options]

    Options:
        --force     Skip overwrite prompt if folder already exists
        --help      Show this help message
    
    Example:
        node index.js --force
        `);
        return;
    }

    // Prompt user for name of dir
    const answers = await inquirer.prompt([
        {
            name: "projectName",
            message: "What is the name of your microservice?",
            default: "my-service",
        },
    ]);

    const { projectName } = answers;
    const templateDir = path.join(__dirname, "templates", "node-express");
    const targetDir = path.resolve(process.cwd(), projectName);

    // Check if targetDir already exists
    if (fs.existsSync(targetDir)) {
        // show prompt if --force flag was not used
        if (!forceFlag){
            const { shouldOverwrite } = await inquirer.prompt([
                {
                    type: "confirm",
                    name: "shouldOverwrite",
                    message: `The folder "${projectName}" already exists, would you like to overwrite it?`,
                    default: false,
                },
            ]);

            if (!shouldOverwrite) {
                console.log("Operation cancelled.");
                return;
            }
        }

        // if force flag used, rm existing directory immediately
        await fs.remove(targetDir);
        console.log("Existing folder removed~");
    }

    // Copy templates
    console.log(`\nCreating microservice at ${targetDir}...\n`);
    await fs.copy(templateDir, targetDir);

    // Logic to add name of dir to README
    const readmePath = path.join(targetDir, 'README.md');

    if (await fs.pathExists(readmePath)) {
        let content = await fs.readFile(readmePath, 'utf-8');
        content = content.replace(/{{SERVICE_NAME}}/g, projectName);
        await fs.writeFile(readmePath, content, 'utf-8');
        console.log("README updated with project name.");
    }

    console.log("Project scaffolded!!");

    console.log("\nNext Steps: ");
    console.log(`   cd ${projectName}`);
    console.log("   npm install");
    console.log("   node app.js");
    console.log("   docker build -t my-service .");
    console.log("   npm test");
}

main();