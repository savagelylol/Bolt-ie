import { renderOverviewPage } from './pages/overview';
import { renderGeneralPage } from './pages/general';
import { renderAccessPage } from './pages/access';
import { renderModerationPage } from './pages/moderation';
import { renderBrowserPage } from './pages/browser';
import { renderLoggingPage } from './pages/logging';
import { renderIntegrationsPage } from './pages/integrations';
import { renderQolPage } from './pages/qol';
import { renderAuditPage } from './pages/audit';

const API_BASE = '/api';

const FUNNY_BOT_MESSAGES = [
  "The bot would like to join the party. 🎉",
  "Hey, can I get a plus one? 🤖",
  "Knock knock! Who's there? A bot! 🚪",
  "I promise I'm not as boring as I look. 🎮",
  "Let me in and I'll be super helpful! 😇",
  "I brought snacks (digital ones, but still). 🍪",
  "Time to enable some serious bot magic! ✨",
  "Don't leave me hanging! 🤝",
  "Your server is about to get a major glow-up. 💫",
  "I'm here to make your life easier (no cap). 📈",
  "All the cool kids are adding bots. 😎",
  "I swear I'm not spam... I'm *quality* spam. 📧",
  "Ready to make this server legendary? 🏆",
  "Plot twist: the bot is actually useful. 🎬",
  "Beep boop! Translation: let me in please? 🔊"
];

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

let currentUser: User | null = null;
let currentGuild: string | null = null;
let currentSettings: any = {};
let csrfToken: string | null = null;
let authToken: string | null = null;
let isMobileMenuOpen = false;
let guilds: Guild[] = [];

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Accept': 'application/json'
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

async function checkAuth(): Promise<boolean> {
  if (!authToken) {
    return false;
  }

  try {
    const headers = getAuthHeaders();

    const response = await fetch(`${API_BASE}/auth/user`, {
      headers
    });

    if (response.ok) {
      currentUser = await response.json() as User;
      console.log('Authenticated as:', currentUser.username);
      await fetchCsrfToken();
      return true;
    }

    localStorage.removeItem('authToken');
    authToken = null;
    return false;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
}

async function fetchCsrfToken() {
  try {
    const response = await fetch(`${API_BASE}/csrf-token`, {
      headers: getAuthHeaders()
    });
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
}

function showLoading() {
  document.getElementById('loading-overlay')?.classList.remove('hidden');
}

function hideLoading() {
  document.getElementById('loading-overlay')?.classList.add('hidden');
}

export function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons: { [key: string]: string } = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span style="font-size: 18px;">${icons[type]}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function renderUserInfo(user: User) {
  const userInfo = document.getElementById('user-info');
  if (!userInfo) return;

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  userInfo.innerHTML = `
    <img src="${avatarUrl}" alt="Avatar" class="user-avatar">
    <div class="user-details">
      <div class="user-name">${user.username}</div>
      <div class="user-tag">#${user.discriminator}</div>
    </div>
  `;
}

async function loadGuilds() {
  try {
    showLoading();

    const headers: HeadersInit = {
      'Accept': 'application/json'
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_BASE}/guilds`, {
      headers,
      credentials: 'include',
      mode: 'cors'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Guild fetch failed:', response.status, errorText);

      if (response.status === 401) {
        localStorage.removeItem('authToken');
        authToken = null;
        window.location.reload();
        return;
      }

      throw new Error(`Failed to fetch guilds: ${response.status}`);
    }

    const data = await response.json();
    guilds = data.guilds || [];

    console.log('Loaded guilds:', guilds.length);

    const guildSelect = document.getElementById('guild-select') as HTMLSelectElement;
    if (guildSelect) {
      guildSelect.innerHTML = '<option value="">Select a server...</option>';

      if (guilds.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No servers with admin permissions found";
        option.disabled = true;
        guildSelect.appendChild(option);
        showNotification('No servers found where you have admin permissions', 'warning');
      } else {
        guilds.forEach((guild: any) => {
          const option = document.createElement('option');
          option.value = guild.id;
          option.textContent = guild.name;
          guildSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Failed to load guilds:', error);
    showNotification('Failed to load servers. Please refresh the page.', 'error');
  } finally {
    hideLoading();
  }
}

let isSelectingGuild = false;

async function selectGuild(guildId: string) {
  // Prevent multiple simultaneous calls
  if (isSelectingGuild) {
    console.log('Already selecting a guild, skipping...');
    return;
  }

  isSelectingGuild = true;
  currentGuild = guildId;
  showLoading();

  try {
    await fetchCsrfToken();

    console.log('🔍 Checking if bot is in guild:', guildId);
    const botCheckResponse = await fetch(`${API_BASE}/guilds/${guildId}/bot-present`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    console.log('📊 Bot check response status:', botCheckResponse.status);

    if (botCheckResponse.ok) {
      const botCheckData = await botCheckResponse.json();
      console.log('🤖 Bot presence data:', botCheckData);
      const { present, inviteUrl } = botCheckData;

      if (!present && inviteUrl) {
        hideLoading();
        closeMobileMenu();

        const randomMessage = FUNNY_BOT_MESSAGES[Math.floor(Math.random() * FUNNY_BOT_MESSAGES.length)];
        const shouldInvite = await showBotInviteModal(randomMessage, inviteUrl);

        if (shouldInvite) {
          window.open(inviteUrl, '_blank');
          showToast('Please complete the bot invitation and refresh the page.', 'warning');
        } else {
          showToast('Cannot manage settings - bot must be in the server.', 'error');
        }
        
        currentGuild = null;
        const select = document.getElementById('guild-select') as HTMLSelectElement;
        if (select) select.value = '';
        isSelectingGuild = false;
        return;
      } else {
        console.log('✅ Bot is present in guild, proceeding...');
      }
    } else {
      console.error('❌ Bot check failed with status:', botCheckResponse.status);
      const errorData = await botCheckResponse.json();
      console.error('Error details:', errorData);
      throw new Error(errorData.error || 'Failed to check bot presence');
    }

    console.log('📡 Fetching settings for guild:', guildId);
    const response = await fetch(`${API_BASE}/settings/${guildId}`, {
      headers: getAuthHeaders(),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Settings fetch failed:', response.status, errorText);
      throw new Error('Failed to load settings');
    }

    currentSettings = await response.json();
    console.log('✅ Settings loaded:', Object.keys(currentSettings).length, 'keys');
    
    closeMobileMenu();
    navigateToPage('overview');
    showToast('Server loaded successfully!', 'success');
  } catch (error) {
    console.error('Failed to load settings:', error);
    showToast('Failed to load server settings. Make sure you have admin permissions.', 'error');
    currentGuild = null;
    const select = document.getElementById('guild-select') as HTMLSelectElement;
    if (select) select.value = '';
  } finally {
    hideLoading();
    isSelectingGuild = false;
  }
}

async function showBotInviteModal(message: string, inviteUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.className = 'bot-invite-modal-overlay';
    modal.innerHTML = `
      <div class="bot-invite-modal">
        <div class="modal-content">
          <h2>🤖 Bot Not Found</h2>
          <p class="bot-message">${message}</p>
          <p class="modal-description">The bot is not in this server yet. Would you like to invite it?</p>
          <div class="modal-buttons">
            <button class="btn-invite" id="btn-invite-yes">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px;">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
              Yes, Invite Bot
            </button>
            <button class="btn-cancel" id="btn-invite-no">Cancel</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const yesBtn = modal.querySelector('#btn-invite-yes') as HTMLButtonElement;
    const noBtn = modal.querySelector('#btn-invite-no') as HTMLButtonElement;

    const cleanup = () => {
      modal.style.opacity = '0';
      setTimeout(() => modal.remove(), 300);
    };

    yesBtn.addEventListener('click', () => {
      cleanup();
      resolve(true);
    });

    noBtn.addEventListener('click', () => {
      cleanup();
      resolve(false);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cleanup();
        resolve(false);
      }
    });
  });
}

export async function saveSettings(settings: any) {
  if (!currentGuild) return;

  showLoading();

  try {
    await fetchCsrfToken();

    const headers: any = {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    };

    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken;
    }

    const response = await fetch(`${API_BASE}/settings/${currentGuild}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ settings, _csrf: csrfToken })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save settings');
    }

    currentSettings = await response.json();
    showToast('Settings saved successfully!', 'success');
    return true;
  } catch (error: unknown) {
    console.error('Failed to save settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
    showToast(errorMessage, 'error');
    return false;
  } finally {
    hideLoading();
  }
}

export function getCurrentSettings() {
  return { ...currentSettings };
}

export function getCurrentGuild() {
  return currentGuild;
}

function showNotification(message: string, type: 'success' | 'error' | 'warning') {
  showToast(message, type === 'warning' ? 'warning' : type);
}

function navigateToPage(pageName: string) {
  if (!currentGuild) {
    showToast('Please select a server first', 'warning');
    return;
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });

  const activeItem = document.querySelector(`[data-page="${pageName}"]`);
  if (activeItem) {
    activeItem.classList.add('active');
  }

  const contentArea = document.getElementById('content-area');
  if (!contentArea) return;

  contentArea.innerHTML = '';

  switch (pageName) {
    case 'overview':
      renderOverviewPage(contentArea);
      break;
    case 'general':
      renderGeneralPage(contentArea);
      break;
    case 'access':
      renderAccessPage(contentArea);
      break;
    case 'moderation':
      renderModerationPage(contentArea);
      break;
    case 'browser':
      renderBrowserPage(contentArea);
      break;
    case 'logging':
      renderLoggingPage(contentArea);
      break;
    case 'integrations':
      renderIntegrationsPage(contentArea);
      break;
    case 'qol':
      renderQolPage(contentArea);
      break;
    case 'audit':
      renderAuditPage(contentArea);
      break;
  }
}

function setupMobileNavigation() {
  const toggle = document.getElementById('mobile-nav-toggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (!toggle || !sidebar || !overlay) return;

  const checkMobile = () => {
    if (window.innerWidth <= 768) {
      toggle.style.display = 'flex';
    } else {
      toggle.style.display = 'none';
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
      isMobileMenuOpen = false;
    }
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);

  toggle.addEventListener('click', () => {
    isMobileMenuOpen = !isMobileMenuOpen;
    if (isMobileMenuOpen) {
      sidebar.classList.add('open');
      overlay.classList.add('active');
    } else {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    }
  });

  overlay.addEventListener('click', () => {
    closeMobileMenu();
  });
}

function closeMobileMenu() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  isMobileMenuOpen = false;
}

async function init() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');

  if (urlToken) {
    localStorage.setItem('authToken', urlToken);
    authToken = urlToken;
    window.history.replaceState({}, '', window.location.pathname);
    showLoading();
  } else {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      authToken = storedToken;
      showLoading();
    }
  }

  const isAuthenticated = authToken ? await checkAuth() : false;

  hideLoading();

  const loginScreen = document.getElementById('login-screen');
  const dashboardScreen = document.getElementById('dashboard-screen');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (urlParams.get('auth') === 'waitlist') {
    showToast('You are on the waitlist! An administrator will approve your access.', 'info');
    window.history.replaceState({}, '', window.location.pathname);
  }

  if (isAuthenticated && currentUser) {
    loginScreen?.classList.add('hidden');
    dashboardScreen?.classList.remove('hidden');
    renderUserInfo(currentUser);
    setupMobileNavigation();
    await loadGuilds();
  } else {
    loginScreen?.classList.remove('hidden');
    dashboardScreen?.classList.add('hidden');
  }

  loginBtn?.addEventListener('click', () => {
    window.location.href = `${API_BASE}/auth/login`;
  });

  logoutBtn?.addEventListener('click', async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        headers: getAuthHeaders()
      });
      localStorage.removeItem('authToken');
      authToken = null;
      showToast('Logged out successfully', 'success');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.removeItem('authToken');
      window.location.reload();
    }
  });

  const guildSelect = document.getElementById('guild-select') as HTMLSelectElement;
  if (guildSelect) {
    guildSelect.addEventListener('change', async (e) => {
      const selectedGuildId = (e.target as HTMLSelectElement).value;
      if (selectedGuildId) {
        await selectGuild(selectedGuildId);
      }
    });
  }

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = (item as HTMLElement).dataset.page;
      if (page) {
        closeMobileMenu();
        navigateToPage(page);
      }
    });
  });
}

init();