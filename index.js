#!/user/bin/env node

// CLI entrypoint

import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { execSync, spawn } from 'child_process';
import open from 'open';

// Support __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    console.log("CLI starting...");
    
    // Check for flags
    const args = process.argv.slice(2);
    const validFlags = ['--help', '--force', '--auto'];

    let showHelp = args.includes('--help');
    let runSetup = args.includes('--auto');
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
        --auto      Skip automation prompt and run setup procedure
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

    // Post-gen automation prompt and execution: npm install + git init
    // Show prompt if --auto flag not used
    if (!runSetup) {
        const { automateSetup } = await inquirer.prompt([
            {
                type: "confirm",
                name: "automateSetup",
                message: "Would you like to automate the next steps? This includes:\nInstalling dependencies\nInitializing git repo\n" +
                            "Building Docker image\nChecking test template was created\nOpening container\n",
                default: true,
            },
        ]);

        runSetup = automateSetup;
    }

    if (runSetup) {
        try {
            console.log("\nInstalling dependencies...");
            execSync('npm install', {cwd: targetDir, stdio: 'inherit' });

            console.log("\nInitializing git repo...");
            execSync('git init', { cwd: targetDir, stdio: 'ignore' });
            execSync('git add .', {cwd: targetDir });
            execSync('git commit -m "Initial commit from create-microservice CLI"', { cwd: targetDir });

            console.log(`Buidling Docker image '${projectName}'...`);
            execSync(`docker build -t ${projectName} .`, { cwd: targetDir, stdio: 'inherit' });

            console.log(`\n Running Docker container (port 3000)...`);
            const container = spawn('docker', ['run', '--rm', '-p', '3000:3000', projectName], {
                cwd: targetDir,
                stdio: 'inherit'
            });

            console.log("\nRunning tests...");
            execSync('npm test', { cwd: targetDir, stdio: 'inherit' });

            // Open browser after delay
            setTimeout(() => {
                open('http://localhost:3000');
            }, 1000);

            container.on('exit', (code) => {
                console.log(`\nDocker container exited with code ${code}`);
            });

            console.log("Setup and run complete!!");
            return;
        } catch (err) {
            console.warn("Automation failed: ", err.message);
        }
    }

    console.log("\nNext Steps: ");
    console.log(`   cd ${projectName}`);
    console.log("   node app.js");
    console.log("   docker build -t my-service .");
    console.log("   npm test");

}

main();