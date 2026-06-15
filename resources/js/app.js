import terminalFiles from '../data/terminal-files.json';

const terminalWindow = document.querySelector('#terminalWindow');
const closeTerminal = document.querySelector('#closeTerminal');
const minimizeTerminal = document.querySelector('#minimizeTerminal');
const maximizeTerminal = document.querySelector('#maximizeTerminal');
const terminalDockIcon = document.querySelector('[data-app="terminal"]');
const terminalTitlebar = document.querySelector('.terminal-titlebar');
const maximizeIcon = '□';
const restoreIcon = '❐';
const desktopOffsetTop = 28;
const desktopOffsetLeft = 54;
const windowMargin = 12;
const dragState = {
    active: false,
    offsetX: 0,
    offsetY: 0,
};
const floatingState = {
    left: null,
    top: null,
};

const hideTerminal = ({ keepActive = true } = {}) => {
    terminalWindow?.classList.add('is-hidden');
    terminalDockIcon?.classList.toggle('active', keepActive);
};

const showTerminal = () => {
    terminalWindow?.classList.remove('is-hidden');
    terminalDockIcon?.classList.add('active');
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const setFloatingPosition = (left, top) => {
    if (!terminalWindow) {
        return;
    }

    const maxLeft = window.innerWidth - terminalWindow.offsetWidth - windowMargin;
    const maxTop = window.innerHeight - terminalTitlebar.offsetHeight - windowMargin;
    const nextLeft = clamp(left, desktopOffsetLeft, maxLeft);
    const nextTop = clamp(top, desktopOffsetTop, maxTop);

    terminalWindow.classList.add('is-floating');
    terminalWindow.style.left = `${nextLeft}px`;
    terminalWindow.style.top = `${nextTop}px`;
    terminalWindow.style.right = 'auto';
    terminalWindow.style.bottom = 'auto';

    floatingState.left = nextLeft;
    floatingState.top = nextTop;
};

const clearFloatingPosition = () => {
    if (!terminalWindow) {
        return;
    }

    terminalWindow.classList.remove('is-floating');
    terminalWindow.style.left = '';
    terminalWindow.style.top = '';
    terminalWindow.style.right = '';
    terminalWindow.style.bottom = '';
};

const toggleMaximized = () => {
    if (!terminalWindow || !maximizeTerminal) {
        return;
    }

    const willMaximize = !terminalWindow.classList.contains('is-maximized');

    if (willMaximize) {
        stopDragging();
        clearFloatingPosition();
        terminalWindow.classList.add('is-maximized');
    } else {
        terminalWindow.classList.remove('is-maximized');

        if (floatingState.left !== null && floatingState.top !== null) {
            setFloatingPosition(floatingState.left, floatingState.top);
        }
    }

    maximizeTerminal.textContent = willMaximize ? restoreIcon : maximizeIcon;
};

closeTerminal?.addEventListener('click', () => {
    hideTerminal({ keepActive: false });
});

minimizeTerminal?.addEventListener('click', () => {
    hideTerminal();
});

maximizeTerminal?.addEventListener('click', () => {
    toggleMaximized();
});

terminalDockIcon?.addEventListener('click', () => {
    if (terminalWindow?.classList.contains('is-hidden')) {
        showTerminal();
        return;
    }

    hideTerminal();
});

terminalTitlebar?.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || !terminalWindow || terminalWindow.classList.contains('is-maximized')) {
        return;
    }

    if (event.target instanceof Element && event.target.closest('.window-btn')) {
        return;
    }

    const rect = terminalWindow.getBoundingClientRect();

    dragState.active = true;
    dragState.offsetX = event.clientX - rect.left;
    dragState.offsetY = event.clientY - rect.top;

    setFloatingPosition(rect.left, rect.top);
    terminalWindow.classList.add('is-dragging');
    terminalTitlebar.setPointerCapture(event.pointerId);
    event.preventDefault();
});

terminalTitlebar?.addEventListener('pointermove', (event) => {
    if (!dragState.active) {
        return;
    }

    setFloatingPosition(
        event.clientX - dragState.offsetX,
        event.clientY - dragState.offsetY,
    );
});

const stopDragging = (event) => {
    if (!dragState.active || !terminalWindow) {
        return;
    }

    dragState.active = false;
    terminalWindow.classList.remove('is-dragging');

    if (event && terminalTitlebar?.hasPointerCapture(event.pointerId)) {
        terminalTitlebar.releasePointerCapture(event.pointerId);
    }
};

terminalTitlebar?.addEventListener('pointerup', stopDragging);
terminalTitlebar?.addEventListener('pointercancel', stopDragging);



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
