
const chalk = require('chalk');

/**
 * Browser Adapter - Handles Puppeteer (Chrome) browser operations
 */

class BrowserAdapter {
    /**
     * Launch Chrome with Puppeteer
     */
    static async launchChrome(chromeLaunchOptions) {
        try {
            const puppeteer = require('puppeteer');
            console.log(chalk.yellow('  Launching Chrome with Puppeteer...'));

            const browser = await puppeteer.launch(chromeLaunchOptions);
            console.log(chalk.green('✓ Chrome browser initialized'));

            return { browser, type: 'puppeteer' };
        } catch (error) {
            console.log(chalk.red('✗ Chrome launch failed:'), chalk.dim(error.message));
            throw error;
        }
    }

    /**
     * Create a new page
     */
    static async createPage(browser, browserType, darkMode = false) {
        let page;
        
        // Puppeteer (Chrome)
        page = await browser.newPage();
        
        if (darkMode) {
            await page.emulateMediaFeatures([
                { name: 'prefers-color-scheme', value: 'dark' }
            ]);
        }

        if (!page) {
            throw new Error(`Failed to create page with ${browserType}`);
        }

        return page;
    }

    /**
     * Close browser safely
     */
    static async closeBrowser(browser, browserType) {
        try {
            if (!browser) return;

            // Puppeteer browser
            try {
                const pages = await browser.pages();
                for (const p of pages) {
                    await p.close().catch(() => {});
                }
            } catch (e) {
                // Ignore errors closing pages
            }

            const browserProcess = browser.process();
            
            try {
                await browser.close();
            } catch (e) {
                // Ignore if already closed
            }

            if (browserProcess) {
                try {
                    browserProcess.kill('SIGKILL');
                } catch (e) {
                    // Process may already be dead
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (e) {
            console.log(chalk.yellow('⚠️  Browser cleanup error:'), chalk.dim(e.message));
        }
    }

    /**
     * Check if browser is connected
     */
    static isConnected(browser, browserType) {
        if (!browser) return false;
        return browser.isConnected();
    }

    /**
     * Force ends maintenance mode for a given guild
     */
    static async forceEndMaintenance(guildId) {
        try {
            const knex = require('knex');
            const db = knex({
                client: 'pg',
                connection: process.env.POSTGRES_URL || process.env.DATABASE_URL,
                pool: { min: 0, max: 5 }
            });

            console.log(chalk.yellow(`🔓 Force ending maintenance mode for guild ${guildId}...`));
            
            // Clear maintenance mode from database
            await db('guild_settings')
                .where({ guild_id: guildId, setting_key: 'maintenanceMode' })
                .update({ setting_value: JSON.stringify(false) });
            
            console.log(chalk.green(`✓ Maintenance mode cleared for guild ${guildId}`));
            
            await db.destroy();
        } catch (error) {
            console.error(chalk.red('Error clearing maintenance mode:'), error);
            throw error;
        }
    }
}

module.exports = BrowserAdapter;
