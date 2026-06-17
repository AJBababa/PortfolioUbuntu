import terminalFiles from '../data/terminal-files.json';
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
createWindowController({
    windowEl: document.querySelector('#cvWindow'),
    titlebarEl: document.querySelector('#cvWindow .terminal-titlebar'),
    dockIcon: document.querySelector('[data-app="cv"]'),
    closeBtn: document.querySelector('#closeCv'),
    minimizeBtn: document.querySelector('#minimizeCv'),
    maximizeBtn: document.querySelector('#maximizeCv'),
    onShow: initCvViewer,
});

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
