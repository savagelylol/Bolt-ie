export function createToggle(
  label: string,
  description: string,
  settingKey: string,
  currentValue: boolean
): HTMLElement {
  const item = document.createElement('div');
  item.className = 'setting-item';
  
  item.innerHTML = `
    <div class="setting-info">
      <div class="setting-label">${label}</div>
      <div class="setting-description">${description}</div>
    </div>
    <div class="setting-control">
      <div class="toggle-switch ${currentValue ? 'active' : ''}" data-setting="${settingKey}"></div>
    </div>
  `;

  const toggle = item.querySelector('.toggle-switch')!;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
  });

  return item;
}

export function createSelect(
  label: string,
  description: string,
  settingKey: string,
  currentValue: string,
  options: Array<{ value: string; label: string }>
): HTMLElement {
  const item = document.createElement('div');
  item.className = 'setting-item';
  
  const optionsHTML = options.map(opt =>
    `<option value="${opt.value}" ${opt.value === currentValue ? 'selected' : ''}>${opt.label}</option>`
  ).join('');

  item.innerHTML = `
    <div class="setting-info">
      <div class="setting-label">${label}</div>
      <div class="setting-description">${description}</div>
    </div>
    <div class="setting-control">
      <select data-setting="${settingKey}">
        ${optionsHTML}
      </select>
    </div>
  `;

  return item;
}

export function createTextInput(
  label: string,
  description: string,
  settingKey: string,
  currentValue: string | number
): HTMLElement {
  const item = document.createElement('div');
  item.className = 'setting-item';
  
  item.innerHTML = `
    <div class="setting-info">
      <div class="setting-label">${label}</div>
      <div class="setting-description">${description}</div>
    </div>
    <div class="setting-control">
      <input type="text" data-setting="${settingKey}" value="${currentValue}">
    </div>
  `;

  return item;
}

export function createNumberInput(
  label: string,
  description: string,
  settingKey: string,
  currentValue: number,
  min?: number,
  max?: number
): HTMLElement {
  const item = document.createElement('div');
  item.className = 'setting-item';
  
  item.innerHTML = `
    <div class="setting-info">
      <div class="setting-label">${label}</div>
      <div class="setting-description">${description}</div>
    </div>
    <div class="setting-control">
      <input type="number" data-setting="${settingKey}" value="${currentValue}"
        ${min !== undefined ? `min="${min}"` : ''} 
        ${max !== undefined ? `max="${max}"` : ''}>
    </div>
  `;

  return item;
}

export function createTagInput(
  label: string,
  description: string,
  settingKey: string,
  currentValues: string[]
): HTMLElement {
  const item = document.createElement('div');
  item.className = 'setting-item';
  item.style.flexDirection = 'column';
  item.style.alignItems = 'flex-start';
  
  item.innerHTML = `
    <div class="setting-info" style="margin-bottom: 12px;">
      <div class="setting-label">${label}</div>
      <div class="setting-description">${description}</div>
    </div>
    <div class="tag-input-container" data-setting="${settingKey}"></div>
  `;

  const container = item.querySelector('.tag-input-container') as HTMLElement;
  
  currentValues.forEach(value => {
    addTag(container, value);
  });

  const input = document.createElement('input');
  input.className = 'tag-input';
  input.type = 'text';
  input.placeholder = 'Add and press Enter...';
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      e.preventDefault();
      addTag(container, input.value.trim());
      input.value = '';
    }
  });

  container.appendChild(input);

  return item;
}

function addTag(container: HTMLElement, value: string) {
  const tag = document.createElement('span');
  tag.className = 'tag';
  tag.innerHTML = `
    ${value}
    <span class="tag-remove">×</span>
  `;

  tag.querySelector('.tag-remove')?.addEventListener('click', () => {
    tag.remove();
  });

  const input = container.querySelector('.tag-input');
  container.insertBefore(tag, input);
}

export function getTagValues(container: HTMLElement): string[] {
  const tags = container.querySelectorAll('.tag');
  return Array.from(tags).map(tag => tag.textContent?.replace('×', '').trim() || '');
}
