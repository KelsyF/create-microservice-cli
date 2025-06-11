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
        const { shouldOverwrite } = await inquirer.prompt([
            {
                tyupe: "confirm",
                name: "shouldOverwrite",
                message: `The folder "${projectName}" already exists, would you like to overwrite it?`,
                default: false,
            },
        ]);

        if (!shouldOverwrite) {
            console.log("Operation cancelled.");
            return;
        }

        await fs.remove(targetDir);
        console.log("Existing folder removed~");
    }

    // Copy templates
    console.log(`\nCreating microservice at ${targetDir}...\n`);
    await fs.copy(templateDir, targetDir);
    console.log("Project scaffolded!!");

    console.log("\nNext Steps: ");
    console.log(`cd ${projectName}`);
    console.log("npm install");
    console.log("node app.js");
    console.log("docker build -t my-service .");
    console.log("npm test");
}

main();