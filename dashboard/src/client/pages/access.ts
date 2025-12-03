import { getCurrentSettings, saveSettings } from '../main';
import { createToggle, createTagInput, getTagValues } from '../components/inputs';

export function renderAccessPage(container: HTMLElement) {
  const settings = getCurrentSettings();

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Access Control</h1>
      <p class="page-description">Manage who can use the bot and what they can do</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Role Access Control</h2>
        <p class="card-description">Control which roles can use the bot</p>
      </div>
      <div class="setting-group" id="role-settings"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">User Access</h2>
        <p class="card-description">Manage trusted users and restrictions</p>
      </div>
      <div class="setting-group" id="user-settings"></div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Bot Status</h2>
        <p class="card-description">Control bot availability</p>
      </div>
      <div class="setting-group" id="status-settings"></div>
    </div>

    <div class="save-panel">
      <button class="btn btn-success" id="save-access">Save Changes</button>
    </div>
  `;

  const roleSettings = document.getElementById('role-settings')!;
  roleSettings.appendChild(createTagInput(
    'Allowed Roles',
    'Role IDs that can use the bot (leave empty for all)',
    'allowRoleIDs',
    settings.allowRoleIDs || []
  ));
  roleSettings.appendChild(createTagInput(
    'Blocked Roles',
    'Role IDs that are blocked from using the bot',
    'blockRoleIDs',
    settings.blockRoleIDs || []
  ));
  roleSettings.appendChild(createTagInput(
    'Moderator Roles',
    'Role IDs with moderator permissions',
    'modRoleIDs',
    settings.modRoleIDs || []
  ));
  roleSettings.appendChild(createTagInput(
    'Viewer Roles',
    'Role IDs with view-only permissions',
    'viewerRoleIDs',
    settings.viewerRoleIDs || []
  ));

  const userSettings = document.getElementById('user-settings')!;
  userSettings.appendChild(createTagInput(
    'Trusted Users',
    'User IDs with elevated permissions',
    'trustedUserIDs',
    settings.trustedUserIDs || []
  ));
  userSettings.appendChild(createTagInput(
    'Restricted Channels',
    'Channel IDs where bot is restricted',
    'restrictedChannelIDs',
    settings.restrictedChannelIDs || []
  ));

  const statusSettings = document.getElementById('status-settings')!;
  statusSettings.appendChild(createToggle(
    'Maintenance Mode',
    'Disable bot for maintenance (admin only)',
    'maintenanceMode',
    settings.maintenanceMode
  ));
  statusSettings.appendChild(createToggle(
    'Admin Only Commands',
    'Restrict all commands to admins only',
    'adminOnlyCommands',
    settings.adminOnlyCommands
  ));

  document.getElementById('save-access')?.addEventListener('click', () => collectAndSave(container));
}

function collectAndSave(container: HTMLElement) {
  const updates: any = {};
  
  container.querySelectorAll('[data-setting]').forEach(element => {
    const key = (element as HTMLElement).dataset.setting!;
    
    if (element.classList.contains('toggle-switch')) {
      updates[key] = element.classList.contains('active');
    } else if (element.classList.contains('tag-input-container')) {
      updates[key] = getTagValues(element as HTMLElement);
    }
  });

  saveSettings(updates);
}
