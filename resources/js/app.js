import terminalFiles from '../data/terminal-files.json';
import projects from '../data/projects.json';
import { initCvViewer } from './cv-viewer.js';

const maximizeIcon = '□';
const restoreIcon = '❐';
const desktopOffsetTop = 28;
const desktopOffsetLeft = 54;
const windowMargin = 12;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Window focus manager: brings the clicked window to front and marks it active.
const windowControllers = [];
let topZIndex = 30;

const focusWindow = (controller) => {
    if (!controller) {
        return;
    }

    topZIndex += 1;
    controller.windowEl.style.zIndex = `${topZIndex}`;

    windowControllers.forEach((other) => {
        other.windowEl.classList.toggle('is-active', other === controller);
    });
};

// Reusable window controller: show/hide, maximize and drag for any window.
const createWindowController = ({ windowEl, titlebarEl, dockIcon, closeBtn, minimizeBtn, maximizeBtn, onShow }) => {
    if (!windowEl) {
        return null;
    }

    const controller = { windowEl };
    windowControllers.push(controller);

    const floatingState = { left: null, top: null };
    const dragState = { active: false, offsetX: 0, offsetY: 0 };

    const hide = ({ keepActive = true } = {}) => {
        windowEl.classList.add('is-hidden');
        dockIcon?.classList.toggle('active', keepActive);
    };

    const show = () => {
        windowEl.classList.remove('is-hidden');
        dockIcon?.classList.add('active');
        focusWindow(controller);
        onShow?.();
    };

    const setFloatingPosition = (left, top) => {
        const maxLeft = window.innerWidth - windowEl.offsetWidth - windowMargin;
        const maxTop = window.innerHeight - titlebarEl.offsetHeight - windowMargin;
        const nextLeft = clamp(left, desktopOffsetLeft, maxLeft);
        const nextTop = clamp(top, desktopOffsetTop, maxTop);

        windowEl.classList.add('is-floating');
        windowEl.style.left = `${nextLeft}px`;
        windowEl.style.top = `${nextTop}px`;
        windowEl.style.right = 'auto';
        windowEl.style.bottom = 'auto';

        floatingState.left = nextLeft;
        floatingState.top = nextTop;
    };

    const clearFloatingPosition = () => {
        windowEl.classList.remove('is-floating');
        windowEl.style.left = '';
        windowEl.style.top = '';
        windowEl.style.right = '';
        windowEl.style.bottom = '';
    };

    const stopDragging = (event) => {
        if (!dragState.active) {
            return;
        }

        dragState.active = false;
        windowEl.classList.remove('is-dragging');

        if (event && titlebarEl?.hasPointerCapture(event.pointerId)) {
            titlebarEl.releasePointerCapture(event.pointerId);
        }
    };

    const toggleMaximized = () => {
        if (!maximizeBtn) {
            return;
        }

        const willMaximize = !windowEl.classList.contains('is-maximized');

        if (willMaximize) {
            stopDragging();
            clearFloatingPosition();
            windowEl.classList.add('is-maximized');
        } else {
            windowEl.classList.remove('is-maximized');

            if (floatingState.left !== null && floatingState.top !== null) {
                setFloatingPosition(floatingState.left, floatingState.top);
            }
        }

        maximizeBtn.textContent = willMaximize ? restoreIcon : maximizeIcon;
    };

    closeBtn?.addEventListener('click', () => hide({ keepActive: false }));
    minimizeBtn?.addEventListener('click', () => hide());
    maximizeBtn?.addEventListener('click', () => toggleMaximized());

    dockIcon?.addEventListener('click', () => {
        if (windowEl.classList.contains('is-hidden')) {
            show();
            return;
        }

        hide();
    });

    // Clicking anywhere on the window brings it to front.
    windowEl.addEventListener('pointerdown', () => focusWindow(controller));

    titlebarEl?.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || windowEl.classList.contains('is-maximized')) {
            return;
        }

        if (event.target instanceof Element && event.target.closest('.window-btn')) {
            return;
        }

        const rect = windowEl.getBoundingClientRect();

        dragState.active = true;
        dragState.offsetX = event.clientX - rect.left;
        dragState.offsetY = event.clientY - rect.top;

        setFloatingPosition(rect.left, rect.top);
        windowEl.classList.add('is-dragging');
        titlebarEl.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    titlebarEl?.addEventListener('pointermove', (event) => {
        if (!dragState.active) {
            return;
        }

        setFloatingPosition(
            event.clientX - dragState.offsetX,
            event.clientY - dragState.offsetY,
        );
    });

    titlebarEl?.addEventListener('pointerup', stopDragging);
    titlebarEl?.addEventListener('pointercancel', stopDragging);

    controller.show = show;
    controller.hide = hide;
    controller.toggleMaximized = toggleMaximized;

    return controller;
};

// Terminal window
const terminalController = createWindowController({
    windowEl: document.querySelector('#terminalWindow'),
    titlebarEl: document.querySelector('#terminalWindow .terminal-titlebar'),
    dockIcon: document.querySelector('[data-app="terminal"]'),
    closeBtn: document.querySelector('#closeTerminal'),
    minimizeBtn: document.querySelector('#minimizeTerminal'),
    maximizeBtn: document.querySelector('#maximizeTerminal'),
});

// CV window
const cvController = createWindowController({
    windowEl: document.querySelector('#cvWindow'),
    titlebarEl: document.querySelector('#cvWindow .terminal-titlebar'),
    dockIcon: document.querySelector('[data-app="cv"]'),
    closeBtn: document.querySelector('#closeCv'),
    minimizeBtn: document.querySelector('#minimizeCv'),
    maximizeBtn: document.querySelector('#maximizeCv'),
    onShow: initCvViewer,
});

// File explorer window
createWindowController({
    windowEl: document.querySelector('#filesWindow'),
    titlebarEl: document.querySelector('#filesWindow .terminal-titlebar'),
    dockIcon: document.querySelector('[data-app="desktop"]'),
    closeBtn: document.querySelector('#closeFiles'),
    minimizeBtn: document.querySelector('#minimizeFiles'),
    maximizeBtn: document.querySelector('#maximizeFiles'),
});

// The explorer reads the same files the terminal serves, so both stay in sync.
const fileContent = (name) => terminalFiles[name]?.join('\n') ?? '';

const fileSystem = {
    desktop: [
        { name: 'Projects', type: 'folder', path: 'projects' },
        { name: 'Documents', type: 'folder', path: 'documents' },
        { name: 'Álvaro.md', type: 'text', content: fileContent('Álvaro.md') },
        { name: 'cv-alvaro-jimenez.pdf', type: 'pdf' },
        { name: 'github.url', type: 'link', href: 'https://github.com/AJBababa' },
    ],
    documents: [
        { name: 'skills.json', type: 'text', content: fileContent('skills.json') },
        { name: 'projects.txt', type: 'text', content: fileContent('projects.txt') },
        { name: 'contact.sh', type: 'text', content: fileContent('contact.sh') },
    ],
    projects: Object.entries(projects).map(([slug, project]) => ({
        name: project.name,
        type: 'folder',
        path: `projects/${slug}`,
    })),
};

const folderLabels = { desktop: 'Desktop', documents: 'Documents', projects: 'Projects' };
const projectAt = (path) => projects[path.split('/').at(-1)];
const segmentLabel = (segment) => folderLabels[segment] ?? projects[segment]?.name ?? segment;

const filesGrid = document.querySelector('#filesGrid');
const filesProject = document.querySelector('#filesProject');
const filesLocation = document.querySelector('#filesLocation');
const filesWindowTitle = document.querySelector('#filesWindowTitle');
const filesStatus = document.querySelector('#filesStatus');
const filesBack = document.querySelector('#filesBack');
const filesForward = document.querySelector('#filesForward');
const filePreview = document.querySelector('#filePreview');
const pathHistory = ['desktop'];
let historyIndex = 0;

const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);

    node.append(...children.filter(Boolean));

    return node;
};

// Yaru (Ubuntu) icon set, copied from the upstream theme into public/images/icons.
const filesWindow = document.querySelector('#filesWindow');
const iconBase = filesWindow?.dataset.iconBase ?? '/images/icons';
const coverBase = filesWindow?.dataset.coverBase ?? '/images/projects';

const extensionIcons = {
    css: 'text-css',
    html: 'text-html',
    jpeg: 'image-x-generic',
    jpg: 'image-x-generic',
    js: 'text-x-javascript',
    json: 'application-json',
    md: 'text-markdown',
    pdf: 'application-pdf',
    php: 'text-x-php',
    png: 'image-x-generic',
    sh: 'application-x-shellscript',
    svg: 'image-x-generic',
    txt: 'text-x-generic',
    url: 'application-x-mswinurl',
    zip: 'application-zip',
};

const typeIcons = { folder: 'folder', text: 'text-x-generic', link: 'application-x-mswinurl' };

// Like Nautilus: the file name decides the icon, and the entry type is the fallback.
const fileIconName = (file) => {
    if (file.type === 'folder') {
        return 'folder';
    }

    if (/^readme\./i.test(file.name)) {
        return 'text-x-readme';
    }

    const extension = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : '';

    return extensionIcons[extension] ?? typeIcons[file.type] ?? 'text-x-generic';
};

const createFileIcon = (file, className) => {
    const icon = document.createElement('img');

    icon.className = className;
    icon.src = `${iconBase}/${fileIconName(file)}.png`;
    icon.alt = '';
    icon.setAttribute('aria-hidden', 'true');

    return icon;
};

const showFilePreview = (file) => {
    document.querySelector('#filePreviewIcon').replaceChildren(createFileIcon(file, 'file-preview-img'));
    document.querySelector('#filePreviewName').textContent = file.name;
    document.querySelector('#filePreviewContent').textContent = file.content || 'Este archivo está vacío.';
    filePreview?.classList.remove('is-hidden');
};

// GitHub's own language colours, so the bar reads the same as on the repo page.
const languageColors = {
    Blade: '#f7523f',
    CSS: '#663399',
    Dockerfile: '#384d54',
    HTML: '#e34c26',
    JavaScript: '#f1e05a',
    PHP: '#4F5D95',
    SCSS: '#c6538c',
    Shell: '#89e051',
    TypeScript: '#3178c6',
};

const round1 = (value) => Math.round(value * 10) / 10;

// Raw byte counts come straight from the GitHub API; percentages are derived here.
const languageBreakdown = (languages = {}) => {
    const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);

    if (!total) {
        return [];
    }

    const entries = Object.entries(languages).sort(([, a], [, b]) => b - a);
    const percents = entries.map(([, bytes]) => round1((bytes / total) * 100));

    // Rounding each language separately can drift off 100%. GitHub absorbs that
    // drift into the biggest language, so the bar always adds up exactly.
    percents[0] = round1(100 - percents.slice(1).reduce((sum, percent) => sum + percent, 0));

    return entries.map(([name], index) => ({
        name,
        percent: percents[index],
        color: languageColors[name] ?? '#8b8680',
    }));
};

const renderLanguages = (languages) => {
    const breakdown = languageBreakdown(languages);

    if (!breakdown.length) {
        return null;
    }

    const bar = el('div', { className: 'language-bar' }, ...breakdown.map((language) => el('span', {
        className: 'language-segment',
        title: `${language.name} ${language.percent.toFixed(1)}%`,
        style: `width: ${language.percent}%; background: ${language.color}`,
    })));

    const legend = el('ul', { className: 'language-legend' }, ...breakdown.map((language) => el(
        'li',
        { className: 'language-legend-item' },
        el('span', { className: 'language-dot', style: `background: ${language.color}` }),
        el('span', { className: 'language-name', textContent: language.name }),
        el('span', { className: 'language-percent', textContent: `${language.percent.toFixed(1)}%` }),
    )));

    return el('section', { className: 'project-languages' }, bar, legend);
};

const renderProject = (path) => {
    const project = projectAt(path);

    if (!filesProject || !project) {
        return;
    }

    const cover = el('img', {
        className: 'project-cover',
        src: `${coverBase}/${project.cover}`,
        alt: `Portada de ${project.name}`,
        loading: 'lazy',
    });

    const intro = el(
        'div',
        { className: 'project-intro' },
        el('h2', { className: 'project-name', textContent: project.name }),
        el('p', { className: 'project-tagline', textContent: project.tagline }),
        el('p', { className: 'project-description', textContent: project.description }),
    );

    const stack = el('ul', { className: 'project-stack' }, ...project.stack.map((tech) => el('li', {
        className: 'project-tag',
        textContent: tech,
    })));

    // Optional: what I personally built, for projects worked on as a team.
    const highlights = project.highlights?.length
        ? el(
            'section',
            { className: 'project-highlights' },
            el('h3', { className: 'project-highlights-title', textContent: 'Mi aportación' }),
            el('ul', {}, ...project.highlights.map((item) => el('li', { textContent: item }))),
        )
        : null;

    const link = (href, text, modifier) => el('a', {
        className: `project-action ${modifier}`,
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        textContent: text,
    });

    const actions = el(
        'div',
        { className: 'project-actions' },
        project.repo ? link(project.repo, 'Ver en GitHub', 'is-primary') : null,
        project.demo ? link(project.demo, 'Abrir proyecto', 'is-secondary') : null,
        project.private ? el('span', { className: 'project-note', textContent: 'Repositorio privado' }) : null,
    );

    // replaceChildren() would print a literal "null" for the optional sections.
    filesProject.replaceChildren(...[
        el('div', { className: 'project-hero' }, cover, intro),
        stack,
        highlights,
        renderLanguages(project.languages),
        actions,
    ].filter(Boolean));

    filesStatus.textContent = project.repo
        ? project.repo.replace('https://', '')
        : `${project.name} · repositorio privado`;
};

const renderFiles = (path, { addToHistory = true } = {}) => {
    const project = projectAt(path);

    if (!filesGrid || (!fileSystem[path] && !project)) {
        return;
    }

    if (addToHistory && pathHistory[historyIndex] !== path) {
        pathHistory.splice(historyIndex + 1);
        pathHistory.push(path);
        historyIndex = pathHistory.length - 1;
    }

    const segments = path.split('/');

    filePreview?.classList.add('is-hidden');
    filesWindowTitle.textContent = segmentLabel(segments.at(-1));
    filesLocation.textContent = `/home/alvaro/${segments.map(segmentLabel).join('/')}`;
    filesBack.disabled = historyIndex === 0;
    filesForward.disabled = historyIndex === pathHistory.length - 1;

    // A project folder opens as a detail sheet instead of a file grid.
    filesGrid.classList.toggle('is-hidden', Boolean(project));
    filesProject?.classList.toggle('is-hidden', !project);

    document.querySelectorAll('[data-files-path]').forEach((place) => {
        const placePath = place.dataset.filesPath;

        place.classList.toggle('is-selected', path === placePath || path.startsWith(`${placePath}/`));
    });

    if (project) {
        renderProject(path);
        return;
    }

    filesStatus.textContent = `${fileSystem[path].length} items`;

    filesGrid.replaceChildren(...fileSystem[path].map((file) => {
        const item = document.createElement('button');
        const icon = createFileIcon(file, 'file-item-icon');
        const name = document.createElement('span');

        item.type = 'button';
        item.className = 'file-item';
        name.textContent = file.name;
        item.append(icon, name);

        if (file.href) {
            item.title = file.href;
        }
        item.addEventListener('dblclick', () => {
            if (file.path) {
                renderFiles(file.path);
                return;
            }

            if (file.type === 'pdf') {
                cvController?.show();
                return;
            }

            if (file.type === 'link') {
                window.open(file.href, '_blank', 'noopener');
                return;
            }

            showFilePreview(file);
        });
        item.addEventListener('click', () => {
            document.querySelectorAll('.file-item.is-selected').forEach((selected) => selected.classList.remove('is-selected'));
            item.classList.add('is-selected');
        });
        return item;
    }));
};

document.querySelectorAll('[data-files-path]').forEach((place) => {
    place.addEventListener('click', () => renderFiles(place.dataset.filesPath));
});
document.querySelector('#filesHome')?.addEventListener('click', () => renderFiles('desktop'));
document.querySelector('#closeFilePreview')?.addEventListener('click', () => filePreview?.classList.add('is-hidden'));
filesBack?.addEventListener('click', () => {
    if (historyIndex > 0) renderFiles(pathHistory[--historyIndex], { addToHistory: false });
});
filesForward?.addEventListener('click', () => {
    if (historyIndex < pathHistory.length - 1) renderFiles(pathHistory[++historyIndex], { addToHistory: false });
});
renderFiles('desktop', { addToHistory: false });

// The terminal is the active window on startup.
focusWindow(terminalController);


// Terminal command handling

const terminalBody = document.querySelector('#terminalBody');
const terminalOutput = document.querySelector('#terminalOutput');
const terminalInput = document.querySelector('#terminalInput');

const promptHtml = `
    <span class="prompt-user">alvaro@AlvarOS-desktop</span>
    <span class="prompt-separator">:</span>
    <span class="prompt-path">~</span>
    <span class="prompt-symbol">$</span>
`;

const commands = {
    help: [
        'Available commands:',
        '',
        '  help              Show available commands',
        '  clear             Clear terminal',
        '  ls                List files',
        '  cat <file>        Show file content',
        '  sudo cat <file>   Show file content, dramatically',
        '',
    ],
};

const getFileNames = () => Object.keys(terminalFiles);

const findFile = (requestedFile) => {
    const normalizedRequestedFile = requestedFile.trim().toLowerCase();

    return getFileNames().find((fileName) => {
        const normalizedFileName = fileName.toLowerCase();

        return (
            normalizedFileName === normalizedRequestedFile ||
            normalizedFileName.replace('.md', '') === normalizedRequestedFile ||
            normalizedFileName.replace('.txt', '') === normalizedRequestedFile ||
            normalizedFileName.replace('.json', '') === normalizedRequestedFile ||
            normalizedFileName.replace('.sh', '') === normalizedRequestedFile
        );
    });
};

const scrollTerminalToBottom = () => {
    if (!terminalBody) {
        return;
    }

    terminalBody.scrollTop = terminalBody.scrollHeight;
};

const appendCommandLine = (command) => {
    if (!terminalOutput) {
        return;
    }

    const line = document.createElement('div');
    line.className = 'terminal-command';
    line.innerHTML = `${promptHtml}<span style="margin-left: 7px;">${escapeHtml(command)}</span>`;

    terminalOutput.appendChild(line);
};

const appendResponse = (lines, className = '') => {
    if (!terminalOutput) {
        return;
    }

    const responseLines = Array.isArray(lines) ? lines : [lines];

    responseLines.forEach((lineText) => {
        const line = document.createElement('div');
        line.className = `terminal-response ${className}`.trim();
        line.innerHTML = linkifyTerminalLine(lineText);
        terminalOutput.appendChild(line);
    });
};

const escapeHtml = (value) => {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
};

const linkifyTerminalLine = (value) => {
    const escapedValue = escapeHtml(value);
    const githubRepoPattern = /github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g;

    return escapedValue.replace(githubRepoPattern, (repoUrl) => {
        const href = `https://${repoUrl}`;

        return `<a class="terminal-link" href="${href}" target="_blank" rel="noopener noreferrer">${repoUrl}</a>`;
    });
};

const runCommand = (rawCommand) => {
    const command = rawCommand.trim();
    const normalizedCommand = command.toLowerCase();

    if (!command) {
        appendCommandLine('');
        return;
    }

    if (normalizedCommand === 'clear') {
        terminalOutput.innerHTML = '';
        return;
    }

    appendCommandLine(command);

    if (normalizedCommand === 'ls') {
        appendResponse(getFileNames());
        return;
    }

    const catPrefix = ['cat ', 'sudo cat '].find((prefix) => normalizedCommand.startsWith(prefix));

    if (catPrefix) {
        const requestedFile = command.slice(catPrefix.length).trim();

        if (!requestedFile) {
            appendResponse('cat: missing file operand', 'terminal-error');
            return;
        }

        const fileName = findFile(requestedFile);

        if (!fileName) {
            appendResponse(`cat: ${requestedFile}: No such file or directory`, 'terminal-error');
            return;
        }

        if (catPrefix === 'cat ' && fileName === 'hireme.txt') {
            appendResponse(`cat: ${requestedFile}: Permission denied`);
            return;
        }

        appendResponse(terminalFiles[fileName]);
        return;
    }

    if (commands[normalizedCommand]) {
        appendResponse(commands[normalizedCommand]);
        return;
    }

    appendResponse(`Command not found: ${command}`, 'terminal-error');
    appendResponse('Type "help" to see available commands.', 'muted');
};

terminalInput?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') {
        return;
    }

    event.preventDefault();

    runCommand(terminalInput.value);
    terminalInput.value = '';

    scrollTerminalToBottom();
});

terminalBody?.addEventListener('click', (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
        return;
    }

    if (window.getSelection()?.toString()) {
        return;
    }

    terminalInput?.focus();
});

window.addEventListener('load', () => {
    terminalInput?.focus();
});
