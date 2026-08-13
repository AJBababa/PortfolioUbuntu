<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AlvarOS</title>
    @vite(['resources/css/app.css', 'resources/css/portfolio.css', 'resources/js/app.js'])
</head>

<body>
    <div class="ubuntu-desktop" style="background-image: url('{{ asset('images/ubuntu-bg.png') }}');">
        <div class="desktop-overlay"></div>

        {{-- Barra superior tipo Ubuntu --}}
        <header class="ubuntu-topbar">
            <div class="topbar-left">
                <span class="activities-pill"></span>
                <span>Activities</span>
            </div>

            <div class="topbar-center">
                <span>AlvarOS</span>
                <span class="demo-badge">demo</span>
            </div>

            <div class="topbar-right">
                <span>ES</span>
                <span>🔊</span>
                <span>⏻</span>
            </div>
        </header>

        {{-- Dock lateral --}}
        <aside class="ubuntu-dock">
            <button class="dock-icon active status-on" data-app="terminal" title="Terminal">
                <img src="{{ asset('images/terminal.png') }}" alt="Terminal">
            </button>

            <button class="dock-icon status-on" data-app="desktop" title="Desktop">
                <img src="{{ asset('images/projects.png') }}" alt="Explorador de archivos">
            </button>

            <button class="dock-icon status-off" data-app="skills" title="Skills">
                <img src="{{ asset('images/skills.png') }}" alt="Skills">
            </button>

            <button class="dock-icon status-on" data-app="cv" title="CV">
                <img src="{{ asset('images/cv.png') }}" alt="CV">
            </button>
            <button class="dock-icon status-off" data-app="contact" title="Contacto">
                <img src="{{ asset('images/contact.png') }}" alt="Contacto">
            </button>

            <div class="dock-spacer"></div>

            <button class="dock-icon status-off" data-app="trash" title="Trash">
                <img src="{{ asset('images/trash.png') }}" alt="Trash">
            </button>
        </aside>

        {{-- Contenido principal --}}
        <main class="desktop-content">
            <section class="terminal-window" id="terminalWindow">
                <div class="terminal-titlebar">
                    <div class="terminal-title-center">
                        alvaro@AlvarOS-desktop: ~
                    </div>

                    <div class="terminal-title-actions">
                        <button class="window-btn" id="minimizeTerminal" type="button">−</button>
                        <button class="window-btn" id="maximizeTerminal" type="button">□</button>
                        <button class="window-btn close" id="closeTerminal" type="button">×</button>
                    </div>
                </div>

                <nav class="terminal-menubar">
                    <span>File</span>
                    <span>Edit</span>
                    <span>View</span>
                    <span>Search</span>
                    <span>Terminal</span>
                    <span>Help</span>
                </nav>

                <div class="terminal-body" id="terminalBody">
                    <div class="terminal-output" id="terminalOutput">
                        <div class="terminal-message">Welcome to AlvarOS.</div>
                        <div class="terminal-message muted">Type "help" to see available commands.</div>
                    </div>

                    <div class="terminal-line terminal-input-line">
                        <span class="prompt-user">alvaro@AlvarOS-desktop</span>
                        <span class="prompt-separator">:</span>
                        <span class="prompt-path">~</span>
                        <span class="prompt-symbol">$</span>

                        <input id="terminalInput" class="terminal-input" type="text" autocomplete="off"
                            spellcheck="false" autofocus>
                    </div>
                </div>
            </section>

            {{-- CV apartado --}}

            <section class="cv-window is-hidden" id="cvWindow">
                <div class="terminal-titlebar cv-titlebar">
                    <div class="terminal-title-center">
                        cv-alvaro-jimenez.pdf
                    </div>

                    <div class="terminal-title-actions">
                        <button class="window-btn" id="minimizeCv" type="button">−</button>
                        <button class="window-btn" id="maximizeCv" type="button">□</button>
                        <button class="window-btn close" id="closeCv" type="button">×</button>
                    </div>
                </div>

                <div class="cv-toolbar">
                    <span>Document Viewer</span>

                    <div class="cv-toolbar-actions">
                        <a href="{{ asset('files/cv-alvaro-jimenez.pdf') }}" target="_blank" rel="noopener noreferrer">
                            Open
                        </a>

                        <a href="{{ asset('files/cv-alvaro-jimenez.pdf') }}" download>
                            Download
                        </a>
                    </div>
                </div>

                <div class="cv-frame" id="cvViewerContainer" data-pdf-url="{{ asset('files/cv-alvaro-jimenez.pdf') }}">
                    <div id="cvViewer" class="pdfViewer"></div>
                </div>
            </section>

            {{-- Explorador de archivos --}}
            <section class="files-window is-hidden" id="filesWindow" aria-label="Explorador de archivos"
                data-icon-base="{{ asset('images/icons') }}"
                data-cover-base="{{ asset('images/projects') }}">
                <div class="terminal-titlebar files-titlebar">
                    <div class="terminal-title-center" id="filesWindowTitle">Desktop</div>

                    <div class="terminal-title-actions">
                        <button class="window-btn" id="minimizeFiles" type="button" aria-label="Minimizar">&minus;</button>
                        <button class="window-btn" id="maximizeFiles" type="button" aria-label="Maximizar">&#9633;</button>
                        <button class="window-btn close" id="closeFiles" type="button" aria-label="Cerrar">&times;</button>
                    </div>
                </div>

                <div class="files-toolbar">
                    <button class="files-nav-btn" id="filesBack" type="button" aria-label="Atrás" disabled>
                        <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/go-previous-symbolic.svg') }}')"></span>
                    </button>
                    <button class="files-nav-btn" id="filesForward" type="button" aria-label="Adelante" disabled>
                        <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/go-next-symbolic.svg') }}')"></span>
                    </button>
                    <button class="files-nav-btn" id="filesHome" type="button" aria-label="Ir a Desktop">
                        <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/user-home-symbolic.svg') }}')"></span>
                    </button>
                    <div class="files-location" id="filesLocation">/home/alvaro/Desktop</div>
                    <button class="files-view-btn" type="button" aria-label="Vista de iconos">
                        <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/view-grid-symbolic.svg') }}')"></span>
                    </button>
                </div>

                <div class="files-layout">
                    <aside class="files-sidebar" aria-label="Ubicaciones">
                        <div class="files-sidebar-heading">Places</div>
                        <button class="files-place is-selected" type="button" data-files-path="desktop">
                            <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/user-desktop-symbolic.svg') }}')"></span>
                            Desktop
                        </button>
                        <button class="files-place" type="button" data-files-path="documents">
                            <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/folder-documents-symbolic.svg') }}')"></span>
                            Documents
                        </button>
                        <button class="files-place" type="button" data-files-path="projects">
                            <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/folder-symbolic.svg') }}')"></span>
                            Projects
                        </button>

                        <div class="files-sidebar-heading files-sidebar-section">Devices</div>
                        <div class="files-device">
                            <span class="yaru-icon" style="--yaru-icon: url('{{ asset('images/icons/symbolic/drive-harddisk-symbolic.svg') }}')"></span>
                            AlvarOS
                        </div>
                    </aside>

                    <div class="files-main">
                        <div class="files-grid" id="filesGrid" aria-live="polite"></div>
                        <article class="files-project is-hidden" id="filesProject" aria-live="polite"></article>

                        <div class="file-preview is-hidden" id="filePreview">
                            <button class="file-preview-close" id="closeFilePreview" type="button" aria-label="Cerrar vista previa">&times;</button>
                            <div class="file-preview-icon" id="filePreviewIcon"></div>
                            <strong id="filePreviewName"></strong>
                            <pre id="filePreviewContent"></pre>
                        </div>
                    </div>
                </div>

                <footer class="files-status" id="filesStatus">0 items</footer>
            </section>

        </main>
    </div>
</body>

</html>
