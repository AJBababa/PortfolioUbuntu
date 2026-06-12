<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NOMBREE</title>
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
                <span>NOMBREE</span>
            </div>

            <div class="topbar-right">
                <span>ES</span>
                <span>🔊</span>
                <span>⏻</span>
            </div>
        </header>

        {{-- Dock lateral --}}
        <aside class="ubuntu-dock">
            <button class="dock-icon active" data-app="terminal" title="Terminal">
                <img src="{{ asset('images/terminal.png') }}" alt="Terminal">
            </button>

            <button class="dock-icon" data-app="projects" title="Proyectos">
                <img src="{{ asset('images/projects.png') }}" alt="Proyectos">
            </button>

            <button class="dock-icon" data-app="skills" title="Skills">
                <img src="{{ asset('images/skills.png') }}" alt="Skills">
            </button>

            <button class="dock-icon" data-app="cv" title="CV">
                <img src="{{ asset('images/cv.png') }}" alt="CV">
            </button>
            <button class="dock-icon" data-app="contact" title="Contacto">
                <img src="{{ asset('images/contact.png') }}" alt="Contacto">
            </button>

            <div class="dock-spacer"></div>

            <button class="dock-icon" data-app="trash" title="Trash">
                <img src="{{ asset('images/trash.png') }}" alt="Trash">
            </button>
        </aside>

        {{-- Contenido principal --}}
        <main class="desktop-content">
            <section class="terminal-window" id="terminalWindow">
                <div class="terminal-titlebar">
                    <div class="terminal-title-center">
                        alvaro@NOMBREE-desktop: ~
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
                        <div class="terminal-message">Welcome to NOMBREE.</div>
                        <div class="terminal-message muted">Type "help" to see available commands.</div>
                    </div>

                    <div class="terminal-line terminal-input-line">
                        <span class="prompt-user">alvaro@NOMBREE-desktop</span>
                        <span class="prompt-separator">:</span>
                        <span class="prompt-path">~</span>
                        <span class="prompt-symbol">$</span>

                        <input id="terminalInput" class="terminal-input" type="text" autocomplete="off"
                            spellcheck="false" autofocus>
                    </div>
                </div>
            </section>
        </main>
    </div>
</body>

</html>
