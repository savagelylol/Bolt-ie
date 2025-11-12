/* eslint-disable */
async function pluginInit(page) {
	// Enable CDP request interception for ad blocking
	if (page._browserType === 'puppeteer') {
		// Get CDP session
		const client = await page.target().createCDPSession();
		
		// Enable network domain
		await client.send('Network.enable');
		
		// Ad/tracker domains to block
		const blockedDomains = [
			// Google Ads & Analytics
			'doubleclick.net',
			'googlesyndication.com',
			'googleadservices.com',
			'google-analytics.com',
			'googletagmanager.com',
			'googletagservices.com',
			'googlesyndication.com',
			'adservice.google.com',
			'pagead2.googlesyndication.com',
			'tpc.googlesyndication.com',
			'youtube.com/api/stats',
			'youtube.com/ptracking',
			
			// Facebook/Meta Tracking
			'facebook.com/tr',
			'facebook.net',
			'connect.facebook.net',
			'pixel.facebook.com',
			'analytics.facebook.com',
			'an.facebook.com',
			'static.xx.fbcdn.net',
			'b-graph.facebook.com',
			
			// Amazon Ads
			'amazon-adsystem.com',
			'aax.amazon-adsystem.com',
			'c.amazon-adsystem.com',
			's.amazon-adsystem.com',
			
			// Yahoo/Verizon Media
			'ads.yahoo.com',
			'analytics.yahoo.com',
			'gemini.yahoo.com',
			'sp.analytics.yahoo.com',
			'udc.yahoo.com',
			'udcm.yahoo.com',
			
			// Microsoft/Bing Ads
			'ads.msn.com',
			'ads1.msn.com',
			'adnexus.net',
			'adnxs.com',
			'bat.bing.com',
			'sb.scorecardresearch.com',
			
			// Twitter/X Ads
			'ads-twitter.com',
			'static.ads-twitter.com',
			'analytics.twitter.com',
			't.co/i/adsct',
			
			// TikTok Tracking
			'analytics.tiktok.com',
			'ads.tiktok.com',
			
			// Reddit Ads
			'rereddit.com',
			'events.redditmedia.com',
			
			// Major Ad Networks
			'adform.net',
			'advertising.com',
			'admob.com',
			'adsafeprotected.com',
			'adsrvr.org',
			'adtechus.com',
			'bidswitch.net',
			'casalemedia.com',
			'contextweb.com',
			'criteo.com',
			'criteo.net',
			'openx.net',
			'outbrain.com',
			'pubmatic.com',
			'quantserve.com',
			'rubiconproject.com',
			'taboola.com',
			'turn.com',
			'media.net',
			'sovrn.com',
			'indexww.com',
			'smartadserver.com',
			'advertising.apple.com',
			
			// Analytics & Tracking
			'hotjar.com',
			'mouseflow.com',
			'luckyorange.com',
			'crazyegg.com',
			'mixpanel.com',
			'segment.com',
			'segment.io',
			'amplitude.com',
			'heap.io',
			'fullstory.com',
			'loggly.com',
			'newrelic.com',
			'nr-data.net',
			'clarity.ms',
			'inspectlet.com',
			'kissmetrics.com',
			'chartbeat.com',
			'quantcast.com',
			'comscore.com',
			'scorecardresearch.com',
			'Nielsen.com',
			'omtrdc.net',
			'demdex.net',
			'everesttech.net',
			'2o7.net',
			
			// Privacy-invasive Trackers
			'sentry.io',
			'bugsnag.com',
			'rollbar.com',
			'trackjs.com',
			'errorception.com',
			'raygun.io',
			'airbrake.io',
			
			// Affiliate Networks
			'awin1.com',
			'avantlink.com',
			'anrdoezrs.net',
			'dpbolvw.net',
			'emjcd.com',
			'jdoqocy.com',
			'kqzyfj.com',
			'qksrv.net',
			'tkqlhce.com',
			'apmebf.com',
			'cj.com',
			'commission-junction.com',
			'linksynergy.com',
			'shareasale.com',
			'pepperjam.com',
			'pjtra.com',
			
			// Video Ad Networks
			'imasdk.googleapis.com',
			'2mdn.net',
			'adnxs.com',
			'advertising.com',
			'fwmrm.net',
			'gwallet.com',
			'innovid.com',
			'teads.tv',
			'videohub.tv',
			'tremorhub.com',
			'tubemogul.com',
			
			// Mobile Ad Networks
			'mobileads.google.com',
			'adc3-launch.adcolony.com',
			'ads.mopub.com',
			'api.mixpanel.com',
			'inmobicdn.net',
			'inner-active.mobi',
			'millennialmedia.com',
			'tapjoyads.com',
			'unityads.unity3d.com',
			'vungle.com',
			
			// Retargeting/Remarketing
			'adroll.com',
			'rlcdn.com',
			'perfectaudience.com',
			'retargetly.com',
			'fetchback.com',
			'chango.com',
			'advertising.com',
			
			// Malware/Malicious
			'malware',
			'malvertising',
			'coinminer',
			'cryptominer',
			'crypto-loot',
			'coinhive',
			'jsecoin',
			'minero.cc',
			'miner.pr0gramm.com',
			'authedmine.com',
			
			// Pop-ups & Redirects
			'popads.net',
			'popcash.net',
			'propellerads.com',
			'revcontent.com',
			'mgid.com',
			'zedo.com',
			'bidvertiser.com',
			'clickadu.com',
			'exoclick.com',
			'juicyads.com',
			'trafficjunky.net',
			
			// Generic Patterns (catch-alls)
			'adserver',
			'adservice',
			'advertising',
			'tracker',
			'telemetry',
			'analytics',
			'/ads/',
			'/ad/',
			'/banner',
			'/tracking',
			'/pixel',
			'metrics',
			'tag.js',
			'gtag',
			'fbevents',
			'fbq',
			'_gat',
			'_gaq',
			'collect?',
			'beacon',
			'impression',
			'click?',
			'event?'
		];
		
		// Block requests matching ad patterns
		await client.send('Network.setBlockedURLs', {
			urls: blockedDomains.map(domain => `*${domain}*`)
		});
		
		console.log('🛡️  Ad blocking enabled via CDP');
	}
	
	// Stealth measures to avoid bot detection
	await page.evaluateOnNewDocument(() => {
		// Override the navigator.webdriver property
		Object.defineProperty(navigator, 'webdriver', {
			get: () => false,
		});

		// Override permissions
		const originalQuery = window.navigator.permissions.query;
		window.navigator.permissions.query = (parameters) => (
			parameters.name === 'notifications' ?
				Promise.resolve({ state: Notification.permission }) :
				originalQuery(parameters)
		);

		// Add chrome object
		window.chrome = {
			runtime: {},
		};

		// Override plugins length
		Object.defineProperty(navigator, 'plugins', {
			get: () => [1, 2, 3, 4, 5],
		});

		// Override languages
		Object.defineProperty(navigator, 'languages', {
			get: () => ['en-US', 'en'],
		});
	});

	await page.evaluateOnNewDocument(() => {

		if (window !== window.parent) return;

		window.addEventListener('DOMContentLoaded', () => {

			const box = document.createElement('face-was-here');
			const element = document.createElement('style');

            element.innerHTML = `
              face-was-here {
                pointer-events: none;
                position: absolute;
                top: 980;
                z-index: 10000;
                left: 400;
                width: 20px;
                height: 20px;
                background: rgb(255 0 0);
                border: 1px solid white;
                border-radius: 10px;
                margin: -10px 0 0 -10px;
                padding: 0;
                transition: background .2s, border-radius .2s, border-color .2s;
            }
            face-was-here.i-1 {
                transition: none;
                background: rgba(0,0,0,0.9);
            }
            face-was-here.i-2 {
                transition: none;
                border-color: rgba(0,0,255,0.9);
            }
            face-was-here.i-3 {
                transition: none;
                border-radius: 4px;
            }
            face-was-here.i-4 {
                transition: none;
                border-color: rgba(255,0,0,0.9);
            }
            face-was-here.i-5 {
                transition: none;
                border-color: rgba(0,255,0,0.9);
            }
            `;

			document.head.appendChild(element);
			document.body.appendChild(box);

            box.style.left = '980px';
            box.style.top = '400px';
			/** HANDLE EVENTS */

			document.addEventListener('mousemove', event => {
				box.style.left = event.pageX + 'px';
				box.style.top = event.pageY + 'px';
				update(event.buttons);
			}, true);

			document.addEventListener('mousedown', event => {
				update(event.buttons);
				box.classList.add('i-' + event.which);
			}, true);

			document.addEventListener('mouseup', event => {
				update(event.buttons);
				box.classList.remove('i-' + event.which);
			}, true);

			function update(buttons) {
				for (let i = 0; i < 5; i++) {
					/** TOGGLE CERTAIN PARTS OF THE INSERTED MOUSE */
					box.classList.toggle('i-' + i, buttons & (1 << i));
				}
			}
		}, false);
	});
}

module.exports = pluginInit;