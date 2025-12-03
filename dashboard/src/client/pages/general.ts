import { getCurrentSettings, saveSettings } from '../main';
import { createToggle, createSelect, createTextInput } from '../components/inputs';

export function renderGeneralPage(container: HTMLElement) {
  const settings = getCurrentSettings();

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">General Settings</h1>
      <p class="page-description">Configure general bot behavior and appearance</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Browser Preferences</h2>
        <p class="card-description">Choose default browser and availability</p>
      </div>
      <div class="setting-group" id="browser-settings"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Appearance</h2>
        <p class="card-description">Customize the look and feel</p>
      </div>
      <div class="setting-group" id="appearance-settings"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Localization</h2>
        <p class="card-description">Language and timezone settings</p>
      </div>
      <div class="setting-group" id="localization-settings"></div>
    </div>

    <div class="save-panel">
      <button class="btn btn-success" id="save-general">Save Changes</button>
    </div>
  `;

  const browserSettings = document.getElementById('browser-settings')!;
  browserSettings.appendChild(createSelect(
    'Default Browser',
    'Choose which browser to use by default',
    'defaultBrowser',
    settings.defaultBrowser,
    [
      { value: 'chrome', label: 'Chrome (Chromium)' },
      { value: 'firefox', label: 'Firefox' }
    ]
  ));
  browserSettings.appendChild(createToggle(
    'Allow Firefox',
    'Enable Firefox browser option',
    'allowFirefox',
    settings.allowFirefox
  ));

  const appearanceSettings = document.getElementById('appearance-settings')!;
  appearanceSettings.appendChild(createToggle(
    'Dark Mode',
    'Enable dark mode for bot responses',
    'darkMode',
    settings.darkMode
  ));
  appearanceSettings.appendChild(createSelect(
    'Dashboard Theme',
    'Choose dashboard appearance',
    'dashboardTheme',
    settings.dashboardTheme,
    [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' },
      { value: 'auto', label: 'Auto (System)' }
    ]
  ));

  const localizationSettings = document.getElementById('localization-settings')!;
  localizationSettings.appendChild(createTextInput(
    'Locale',
    'Language locale (e.g., en-US, fr-FR)',
    'locale',
    settings.locale
  ));
  localizationSettings.appendChild(createTextInput(
    'Time Zone',
    'Default timezone (e.g., UTC, America/New_York)',
    'timeZone',
    settings.timeZone
  ));

  document.getElementById('save-general')?.addEventListener('click', collectAndSave);
}

function collectAndSave() {
  const updates: any = {};
  
  document.querySelectorAll('[data-setting]').forEach(element => {
    const key = (element as HTMLElement).dataset.setting!;
    
    if (element.classList.contains('toggle-switch')) {
      updates[key] = element.classList.contains('active');
    } else if (element instanceof HTMLSelectElement || element instanceof HTMLInputElement) {
      const value = element.value;
      updates[key] = element.type === 'number' ? Number(value) : value;
    }
  });

  saveSettings(updates);
}
