import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {

	//@ts-ignore
	webServer: {
		// command: 'npm run dev5000',
		port: 4000,
		reuseExistingServer: true,
	},
	// timeout:5000

};

export default config;
