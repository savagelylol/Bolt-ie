import { getCurrentGuild, getCurrentSettings } from '../main';

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

export async function renderOverviewPage(container: HTMLElement) {
  const guildId = getCurrentGuild();
  const settings = getCurrentSettings();
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Dashboard Overview</h1>
      <p class="page-description">Real-time statistics and quick actions for your server</p>
    </div>

    <div class="stats-grid" id="stats-grid">
      <div class="stat-card" id="stat-settings">
        <span class="stat-icon">⚙️</span>
        <div class="stat-value" id="stat-settings-value">
          <div class="skeleton" style="width: 60px; height: 48px; margin: 0 auto;"></div>
        </div>
        <div class="stat-label">Custom Settings</div>
      </div>
      <div class="stat-card" id="stat-activity">
        <span class="stat-icon">📈</span>
        <div class="stat-value" id="stat-activity-value">
          <div class="skeleton" style="width: 60px; height: 48px; margin: 0 auto;"></div>
        </div>
        <div class="stat-label">Recent Activity</div>
      </div>
      <div class="stat-card" id="stat-uptime">
        <span class="stat-icon">⏱️</span>
        <div class="stat-value" id="stat-uptime-value">
          <div class="skeleton" style="width: 80px; height: 48px; margin: 0 auto;"></div>
        </div>
        <div class="stat-label">Last Updated</div>
      </div>
      <div class="stat-card" id="stat-status">
        <span class="stat-icon">🟢</span>
        <div class="stat-value" id="stat-status-value">
          <div class="skeleton" style="width: 70px; height: 48px; margin: 0 auto;"></div>
        </div>
        <div class="stat-label">Bot Status</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Quick Actions</h2>
        <p class="card-description">Fast access to common configuration tasks</p>
      </div>
      <div class="quick-actions">
        <button class="quick-action-btn" data-action="general">
          <span class="action-icon">⚙️</span>
          <span>General Settings</span>
        </button>
        <button class="quick-action-btn" data-action="browser">
          <span class="action-icon">🌐</span>
          <span>Browser Config</span>
        </button>
        <button class="quick-action-btn" data-action="moderation">
          <span class="action-icon">🛡️</span>
          <span>Moderation</span>
        </button>
        <button class="quick-action-btn" data-action="logging">
          <span class="action-icon">📝</span>
          <span>Logging</span>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">Recent Activity</h2>
        <p class="card-description">Latest changes and events in your server</p>
      </div>
      <div class="activity-river" id="activity-river">
        <div class="empty-state" id="activity-loading">
          <div class="skeleton" style="width: 100%; height: 60px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="width: 100%; height: 60px; margin-bottom: 12px;"></div>
          <div class="skeleton" style="width: 100%; height: 60px;"></div>
        </div>
      </div>
    </div>

    <div class="welcome-section">
      <h3 class="welcome-title">Welcome to Chromie Dashboard</h3>
      <div class="welcome-text">
        <p>This premium dashboard gives you complete control over 40+ settings for Chromie. Here's what you can configure:</p>
        <ul>
          <li>Browser preferences, user agents, and proxy settings</li>
          <li>Access control and role-based permissions</li>
          <li>Advanced moderation and content filtering</li>
          <li>Browser automation and performance tuning</li>
          <li>Logging, webhooks, and alert notifications</li>
          <li>Third-party integrations and custom plugins</li>
        </ul>
        <p style="margin-top: 16px;">Use the sidebar navigation to explore all available settings.</p>
      </div>
    </div>
  `;

  setupQuickActions(container);
  await loadDashboardStats();
  await loadRecentActivity();
}

function setupQuickActions(container: HTMLElement) {
  const quickActionBtns = container.querySelectorAll('.quick-action-btn');
  
  quickActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      if (action) {
        const navItem = document.querySelector(`[data-page="${action}"]`) as HTMLElement;
        if (navItem) {
          navItem.click();
        }
      }
    });
  });
}

async function loadDashboardStats() {
  const guildId = getCurrentGuild();
  if (!guildId) return;

  try {
    const response = await fetch(`${API_BASE}/admin/${guildId}/stats`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (response.ok) {
      const stats = await response.json();
      
      const settingsEl = document.getElementById('stat-settings-value');
      const activityEl = document.getElementById('stat-activity-value');
      const uptimeEl = document.getElementById('stat-uptime-value');
      const statusEl = document.getElementById('stat-status-value');

      if (settingsEl) {
        settingsEl.innerHTML = `${stats.customizedSettings || 0}`;
      }
      if (activityEl) {
        activityEl.innerHTML = `${stats.recentActivity || 0}`;
      }
      if (uptimeEl) {
        if (stats.lastUpdated) {
          const date = new Date(stats.lastUpdated);
          const now = new Date();
          const diff = now.getTime() - date.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const days = Math.floor(hours / 24);
          
          if (days > 0) {
            uptimeEl.innerHTML = `${days}d`;
          } else if (hours > 0) {
            uptimeEl.innerHTML = `${hours}h`;
          } else {
            uptimeEl.innerHTML = `Now`;
          }
        } else {
          uptimeEl.innerHTML = `--`;
        }
      }
      if (statusEl) {
        statusEl.innerHTML = `Active`;
        const statusIcon = document.querySelector('#stat-status .stat-icon');
        if (statusIcon) {
          statusIcon.textContent = '🟢';
        }
      }
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    
    const settingsEl = document.getElementById('stat-settings-value');
    const activityEl = document.getElementById('stat-activity-value');
    const uptimeEl = document.getElementById('stat-uptime-value');
    const statusEl = document.getElementById('stat-status-value');

    if (settingsEl) settingsEl.innerHTML = `0`;
    if (activityEl) activityEl.innerHTML = `0`;
    if (uptimeEl) uptimeEl.innerHTML = `--`;
    if (statusEl) statusEl.innerHTML = `Active`;
  }
}

async function loadRecentActivity() {
  const guildId = getCurrentGuild();
  if (!guildId) return;

  const activityRiver = document.getElementById('activity-river');
  if (!activityRiver) return;

  try {
    const response = await fetch(`${API_BASE}/admin/${guildId}/audit-logs?limit=5`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.logs && data.logs.length > 0) {
        activityRiver.innerHTML = data.logs.map((log: any, index: number) => {
          const date = new Date(log.created_at);
          const timeAgo = getTimeAgo(date);
          const icon = getActionIcon(log.action);
          
          return `
            <div class="activity-item" style="animation-delay: ${index * 0.1}s">
              <div class="activity-bubble">${icon}</div>
              <div class="activity-content">
                <div class="activity-title">${formatAction(log.action)}</div>
                <div class="activity-description">by User ${log.user_id}</div>
                <div class="activity-time">${timeAgo}</div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        activityRiver.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📭</div>
            <div class="empty-state-title">No Recent Activity</div>
            <div class="empty-state-text">Activity will appear here as you make changes</div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Failed to load activity:', error);
    activityRiver.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No Recent Activity</div>
        <div class="empty-state-text">Activity will appear here as you make changes</div>
      </div>
    `;
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
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

function formatAction(action: string): string {
  return action.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}
