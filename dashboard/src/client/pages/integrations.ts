import { getCurrentSettings, saveSettings } from '../main';
import { createToggle, createTextInput, createTagInput, getTagValues } from '../components/inputs';

export function renderIntegrationsPage(container: HTMLElement) {
  const settings = getCurrentSettings();

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Integrations</h1>
      <p class="page-description">Connect third-party services and plugins</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Security Services</h2>
        <p class="card-description">Third-party security and filtering</p>
      </div>
      <div class="setting-group" id="security-settings"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">AI Services</h2>
        <p class="card-description">AI-powered content moderation</p>
      </div>
      <div class="setting-group" id="ai-settings"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Custom Plugins</h2>
        <p class="card-description">Extend bot functionality with plugins</p>
      </div>
      <div class="setting-group" id="plugin-settings"></div>
    </div>

    <div class="save-panel">
      <button class="btn btn-success" id="save-integrations">Save Changes</button>
    </div>
  `;

  const securitySettings = document.getElementById('security-settings')!;
  securitySettings.appendChild(createToggle(
    'Google Safe Browsing',
    'Check URLs with Google Safe Browsing API',
    'enableGoogleSafeBrowsing',
    settings.enableGoogleSafeBrowsing
  ));
  securitySettings.appendChild(createToggle(
    'VirusTotal Scan',
    'Scan files and URLs with VirusTotal',
    'enableVirusTotalScan',
    settings.enableVirusTotalScan
  ));

  const aiSettings = document.getElementById('ai-settings')!;
  aiSettings.appendChild(createToggle(
    'OpenAI Content Filter',
    'Use OpenAI for content moderation',
    'enableOpenAIContentFilter',
    settings.enableOpenAIContentFilter
  ));

  const pluginSettings = document.getElementById('plugin-settings')!;
  pluginSettings.appendChild(createToggle(
    'Enable Custom Plugins',
    'Allow custom plugin loading',
    'enableCustomPlugins',
    settings.enableCustomPlugins
  ));
  pluginSettings.appendChild(createTextInput(
    'Plugin Repository URL',
    'URL to plugin repository',
    'pluginRepositoryURL',
    settings.pluginRepositoryURL || ''
  ));
  pluginSettings.appendChild(createTagInput(
    'Custom Plugin List',
    'List of enabled custom plugins',
    'customPluginList',
    settings.customPluginList || []
  ));

  document.getElementById('save-integrations')?.addEventListener('click', () => collectAndSave(container));
}

function collectAndSave(container: HTMLElement) {
  const updates: any = {};
  
  container.querySelectorAll('[data-setting]').forEach(element => {
    const key = (element as HTMLElement).dataset.setting!;
    
    if (element.classList.contains('toggle-switch')) {
      updates[key] = element.classList.contains('active');
    } else if (element.classList.contains('tag-input-container')) {
      updates[key] = getTagValues(element as HTMLElement);
    } else if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement) {
      updates[key] = element.value;
    }
  });

  saveSettings(updates);
}
