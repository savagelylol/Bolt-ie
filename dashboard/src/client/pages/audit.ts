import { getCurrentGuild } from '../main';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json'
  };
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function renderAuditPage(container: HTMLElement) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Audit Logs</h1>
      <p class="page-description">View all configuration changes and actions</p>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Recent Activity</h2>
        <p class="card-description">Latest changes to server settings</p>
      </div>
      <div id="audit-logs-container">
        <div class="empty-state">
          <div class="skeleton" style="width: 100%; height: 70px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="width: 100%; height: 70px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="width: 100%; height: 70px;"></div>
        </div>
      </div>
      <div style="margin-top: 20px; display: flex; gap: 12px;">
        <button class="btn btn-secondary" id="load-more">Load More</button>
        <button class="btn btn-secondary" id="refresh-logs">Refresh</button>
      </div>
    </div>
  `;

  await loadAuditLogs();

  document.getElementById('load-more')?.addEventListener('click', async () => {
    const container = document.getElementById('audit-logs-container');
    const currentCount = container?.querySelectorAll('.audit-log-item').length || 0;
    await loadAuditLogs(currentCount);
  });

  document.getElementById('refresh-logs')?.addEventListener('click', async () => {
    await loadAuditLogs(0);
  });
}

async function loadAuditLogs(offset: number = 0) {
  const guildId = getCurrentGuild();
  if (!guildId) return;

  try {
    const response = await fetch(
      `${API_BASE}/admin/${guildId}/audit-logs?limit=20&offset=${offset}`,
      { 
        headers: getAuthHeaders(),
        credentials: 'include' 
      }
    );
    
    if (!response.ok) throw new Error('Failed to load audit logs');
    
    const data = await response.json();
    renderAuditLogs(data.logs, offset === 0);
  } catch (error) {
    console.error('Failed to load audit logs:', error);
    const container = document.getElementById('audit-logs-container');
    if (container) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-title">Failed to Load Logs</div>
          <div class="empty-state-text">There was an error loading the audit logs. Please try again.</div>
        </div>
      `;
    }
  }
}

function renderAuditLogs(logs: any[], replace: boolean = true) {
  const container = document.getElementById('audit-logs-container');
  if (!container) return;

  if (replace) {
    container.innerHTML = '';
  }

  if (logs.length === 0 && replace) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <div class="empty-state-title">No Audit Logs</div>
        <div class="empty-state-text">Changes to server settings will appear here.</div>
      </div>
    `;
    return;
  }

  logs.forEach((log, index) => {
    const item = document.createElement('div');
    item.className = 'audit-log-item';
    item.style.animationDelay = `${index * 0.05}s`;
    
    const timestamp = new Date(log.created_at).toLocaleString();
    const action = formatAction(log.action);
    const icon = getActionIcon(log.action);
    
    item.innerHTML = `
      <div class="audit-log-header">
        <span class="audit-action">${icon} ${action}</span>
        <span class="audit-time">${timestamp}</span>
      </div>
      <div class="audit-user">User ID: ${log.user_id}</div>
      ${log.ip_address ? `<div class="audit-user" style="opacity: 0.7;">IP: ${maskIP(log.ip_address)}</div>` : ''}
      ${log.changes ? `<details style="margin-top: 8px;">
        <summary style="cursor: pointer; color: var(--text-muted); font-size: 12px;">View Changes</summary>
        <div style="margin-top: 8px; font-size: 12px; color: var(--text-muted); font-family: monospace; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; overflow-x: auto;">
          ${formatChanges(log.changes)}
        </div>
      </details>` : ''}
    `;
    
    container.appendChild(item);
  });
}

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function getActionIcon(action: string): string {
  const icons: { [key: string]: string } = {
    'SETTINGS_UPDATE': '⚙️',
    'SETTING_UPDATE': '🔧',
    'SETTINGS_RESET': '🔄',
    'LOGIN': '🔑',
    'LOGOUT': '👋'
  };
  return icons[action] || '📝';
}

function maskIP(ip: string): string {
  if (!ip) return '';
  const parts = ip.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.***.***`;
  }
  return ip.substring(0, ip.length / 2) + '***';
}

function formatChanges(changes: any): string {
  try {
    const parsed = typeof changes === 'string' ? JSON.parse(changes) : changes;
    return `<pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${JSON.stringify(parsed, null, 2)}</pre>`;
  } catch {
    return String(changes);
  }
}
