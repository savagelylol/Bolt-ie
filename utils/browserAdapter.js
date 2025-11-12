const chalk = require('chalk');

/**
 * Browser Adapter - Handles Puppeteer (Chrome) browser operations
 */

class BrowserAdapter {
    constructor(browser, page) {
        this.browser = browser;
        this.page = page;
    }

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
        const page = await browser.newPage();
        if (!page) {
            throw new Error(`Failed to create page with ${browserType}`);
        }

        // Apply dark mode if enabled
        if (darkMode) {
            await page.emulateMediaFeatures([
                { name: 'prefers-color-scheme', value: 'dark' }
            ]);
        }

        return page;
    }

    /**
     * Close browser safely
     */
    static async closeBrowser(browser, browserType) {
        try {
            if (!browser) return;

            // Close all pages first
            try {
                const pages = await browser.pages();
                for (const p of pages) {
                    await p.close().catch(() => {});
                }
            } catch (e) {
                // Ignore errors closing pages
            }

            // Get process before closing
            const browserProcess = browser.process();
            
            // Close browser
            try {
                await browser.close();
            } catch (e) {
                // Ignore if already closed
            }

            // Force kill if process exists
            if (browserProcess) {
                try {
                    browserProcess.kill('SIGKILL');
                } catch (e) {
                    // Process may already be dead
                }
            }
            
            // Give it time to fully terminate
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
}

module.exports = BrowserAdapter;
