@php
    // En base64 porque dompdf no resuelve rutas locales de Windows.
    $photo = 'data:image/jpeg;base64,'.base64_encode(file_get_contents(public_path('images/pfp.jpg')));
@endphp
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Álvaro Jiménez Bustos — CV</title>

    <style>
        /*
            Trampas de dompdf que ya han mordido aquí:
            · No soporta box-sizing: siempre content-box, el padding SUMA.
            · Los márgenes de hoja van en @page, nunca como padding de un div.
            · El `size` lo fija setPaper() en CvController; un valor que dompdf
              no entienda descarta la regla entera y te deja sin márgenes.
            · NO metas `html` en el reset de abajo: dompdf aplica los márgenes de
              @page sobre el elemento raíz y `html { margin: 0 }` se los come.

            Ancho útil: 210 - 14 - 14 = 182mm.
        */
        @page {
            margin: 12mm 14mm 10mm 14mm;
        }

        body {
            margin: 0;
            padding: 0;
            font-family: "DejaVu Sans", sans-serif;
            color: #171717;
            background: #ffffff;
            font-size: 8.6pt;
            line-height: 1.36;
        }

        /* VARIABLES VISUALES */

        /*
            Principal: #171717
            Secundario: #5f6368
            Acento: #e95420
            Fondo suave: #f5f5f4
            Línea: #dededb
        */

        /* HOJA */

        /* Sin ancho ni padding: los pone @page. */
        .cv-page {
            position: relative;
        }

        /* TOP LABEL */

        .top-meta {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2.5mm;
        }

        .top-meta td {
            padding: 0;
            vertical-align: middle;
        }

        .document-label {
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 1.6pt;
            color: #e95420;
            text-transform: uppercase;
        }

        .document-year {
            text-align: right;
            font-size: 7pt;
            letter-spacing: 1pt;
            color: #9b9b97;
        }

        /* HEADER */

        .identity-table {
            width: 100%;
            border-collapse: collapse;
        }

        .identity-table td {
            padding: 0;
            vertical-align: top;
        }

        .identity-info {
            padding-right: 11mm !important;
        }

        .identity-photo {
            width: 36mm;
            text-align: right;
        }

        /* Nombre */

        .name {
            margin: 0;
            padding: 0;
            font-size: 23pt;
            line-height: 0.98;
            letter-spacing: -1.1pt;
            color: #171717;
            font-weight: bold;
        }

        .surname {
            color: #171717;
        }

        /* Cargo */

        .role {
            margin: 3.5mm 0 0 0;
            font-size: 9.5pt;
            font-weight: bold;
            letter-spacing: 1.7pt;
            color: #e95420;
            text-transform: uppercase;
        }

        /* Descripción */

        .summary {
            width: 100%;
            margin: 3.2mm 0 0 0;
            color: #62625f;
            font-size: 8.4pt;
            line-height: 1.42;
        }

        /* FOTO */

        /* Cuadrado: pfp.jpg es 640x640 y dompdf ignora object-fit. */
        .photo-wrapper {
            position: relative;
            width: 34mm;
            height: 34mm;
            margin-left: auto;
        }

        /*
            Bloque desplazado detrás de la foto.
            Da un poco de identidad sin recargar.
        */

        .photo-accent {
            position: absolute;
            width: 32mm;
            height: 32mm;
            top: 2mm;
            left: 2mm;
            background: #e95420;
            z-index: 1;
        }

        .photo {
            position: absolute;
            width: 32mm;
            height: 32mm;
            top: 0;
            left: 0;
            z-index: 2;
        }

        /* CONTACTO */

        .contact-bar {
            width: 100%;
            margin-top: 3.5mm;
            border-collapse: collapse;
            background: #171717;
            color: #ffffff;
        }

        .contact-bar td {
            padding: 2.6mm 3.5mm;
            vertical-align: middle;
            font-size: 7.5pt;
        }

        .contact-label {
            display: block;
            margin-bottom: 0.5mm;
            color: #aaaaa5;
            font-size: 5.8pt;
            font-weight: bold;
            letter-spacing: 0.7pt;
            text-transform: uppercase;
        }

        .contact-value {
            color: #ffffff;
            white-space: nowrap;
        }

        .contact-value a {
            color: #ffffff;
            text-decoration: none;
        }

        /* SECCIONES */

        .section {
            margin-top: 3mm;
        }

        .section-header {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2.5mm;
        }

        .section-header td {
            padding: 0;
            vertical-align: middle;
        }

        .section-number {
            width: 10mm;
            color: #e95420;
            font-size: 7pt;
            font-weight: bold;
            letter-spacing: 0.5pt;
        }

        .section-title {
            width: auto;
            font-size: 8pt;
            font-weight: bold;
            letter-spacing: 1.6pt;
            color: #171717;
            text-transform: uppercase;
        }

        .section-line {
            width: 40%;
            padding-left: 4mm !important;
        }

        .section-line div {
            height: 0.5pt;
            background: #dededb;
            width: 100%;
        }

        /* EXPERIENCIA */

        .experience {
            width: 100%;
            border-collapse: collapse;
        }

        .experience-entry {
            page-break-inside: avoid;
        }

        .experience-entry td {
            padding: 0;
            vertical-align: top;
        }

        /*
            Primera columna: fechas.
            Segunda: pequeña línea vertical.
            Tercera: experiencia.
        */

        .experience-date {
            width: 23mm;
            padding-top: 0.5mm !important;
            color: #8a8a86;
            font-size: 7pt;
            line-height: 1.35;
        }

        .experience-marker {
            width: 7mm;
            position: relative;
            border-left: 1pt solid #dededb;
        }

        .experience-marker-dot {
            width: 5px;
            height: 5px;
            background: #e95420;
            border-radius: 50%;
            margin-left: -3px;
            margin-top: 2px;
        }

        .experience-content {
            padding: 0 0 3mm 3mm !important;
        }

        .experience-company {
            margin: 0;
            font-size: 10pt;
            font-weight: bold;
            color: #171717;
        }

        .experience-role {
            margin: 0.5mm 0 0 0;
            color: #e95420;
            font-size: 8pt;
            font-weight: bold;
        }

        .experience-description {
            margin: 2mm 0 0 0;
            color: #62625f;
        }

        .experience-list {
            margin: 2mm 0 0 0;
            padding-left: 4mm;
            color: #62625f;
        }

        .experience-list li {
            margin-bottom: 0.8mm;
        }

        /* BLOQUE DOBLE: EDUCACIÓN + STACK */

        .info-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .info-grid > tbody > tr > td {
            padding: 0;
            vertical-align: top;
        }

        .info-left {
            width: 51%;
            padding-right: 7mm !important;
        }

        .info-right {
            width: 49%;
            padding-left: 7mm !important;
            border-left: 0.5pt solid #dededb;
        }

        /* Formación */

        .education-entry {
            margin-bottom: 3.2mm;
            page-break-inside: avoid;
        }

        .education-title {
            margin: 0;
            font-size: 8.6pt;
            font-weight: bold;
            color: #171717;
        }

        .education-meta {
            margin: 0.7mm 0 0 0;
            color: #777773;
            font-size: 7.4pt;
        }

        .education-year {
            color: #e95420;
            font-weight: bold;
        }

        /* STACK */

        .stack-table {
            width: 100%;
            border-collapse: collapse;
        }

        .stack-table td {
            padding: 0 0 2.5mm 0;
            vertical-align: top;
        }

        .stack-category {
            width: 23mm;
            font-size: 6pt;
            letter-spacing: 0.8pt;
            text-transform: uppercase;
            color: #999994;
            font-weight: bold;
        }

        .stack-values {
            font-size: 7.7pt;
            line-height: 1.45;
            color: #363634;
        }

        .stack-highlight {
            color: #171717;
            font-weight: bold;
        }

        /* IDIOMAS */

        .languages {
            width: 100%;
            border-collapse: collapse;
            margin-top: 2mm;
        }

        .languages td {
            padding: 0;
        }

        .language {
            display: inline-block;
            margin-right: 2mm;
            padding: 1.2mm 2.1mm;
            background: #f3f3f1;
            border: 0.5pt solid #dededb;
            font-size: 7pt;
            color: #444441;
        }

        /* PROYECTOS */

        .projects {
            width: 100%;
            border-collapse: collapse;
        }

        /* Hijos directos: si no, el 50% alcanza a .project-top y le come media
           tarjeta al título. */
        .projects > tbody > tr > td {
            width: 50%;
            vertical-align: top;
            padding: 0;
        }

        .project-left {
            padding-right: 2.5mm !important;
        }

        .project-right {
            padding-left: 2.5mm !important;
        }

        .project {
            border: 0.5pt solid #dededb;
            padding: 3mm;
            min-height: 14mm;
            page-break-inside: avoid;
        }

        .project-top {
            width: 100%;
            border-collapse: collapse;
        }

        .project-top td {
            padding: 0;
            vertical-align: baseline;
        }

        .project-number {
            width: 6mm;
            color: #e95420;
            font-size: 6.5pt;
            font-weight: bold;
        }

        .project-title {
            font-size: 8.5pt;
            font-weight: bold;
            color: #171717;
        }

        .project-description {
            margin: 1.6mm 0 0 0;
            color: #62625f;
            font-size: 7.4pt;
            line-height: 1.36;
        }

        .project-stack {
            margin-top: 1.3mm;
            color: #e95420;
            font-size: 6.5pt;
            font-weight: bold;
        }

        .project-link {
            margin-top: 1mm;
            font-size: 6.5pt;
            color: #8b8b87;
        }

        /* FOOTER */

        /* fixed y no absolute: se ancla a la página, no al final del contenido. */
        .footer {
            position: fixed;
            bottom: -6mm;
            left: 0;
            right: 0;
            border-top: 0.5pt solid #dededb;
            padding-top: 2.5mm;
        }

        .footer-table {
            width: 100%;
            border-collapse: collapse;
        }

        .footer-table td {
            padding: 0;
            font-size: 6pt;
            letter-spacing: 0.5pt;
            color: #a0a09b;
        }

        .footer-right {
            text-align: right;
        }

        .footer-accent {
            color: #e95420;
            font-weight: bold;
        }

        /* GENERAL */

        a {
            text-decoration: none;
        }

        p {
            orphans: 3;
            widows: 3;
        }
    </style>
</head>

<body>

<div class="cv-page">

    {{-- META SUPERIOR --}}

    <table class="top-meta">
        <tr>
            <td class="document-label">
                Curriculum Vitae
            </td>

            <td class="document-year">
                2026 / PALMA DE MALLORCA
            </td>
        </tr>
    </table>

    {{-- IDENTIDAD --}}

    <table class="identity-table">
        <tr>

            <td class="identity-info">

                <h1 class="name">
                    ÁLVARO<br>
                    <span class="surname">JIMÉNEZ BUSTOS</span>
                </h1>

                <p class="role">
                    Full-stack Developer
                </p>

                <p class="summary">
                    Desarrollador web full-stack con experiencia profesional en
                    desarrollo y mantenimiento de aplicaciones web. Formación en
                    desarrollo de aplicaciones web, sistemas y arquitecturas backend,
                    con especial interés en construir productos sólidos, mantenibles
                    y bien diseñados.
                </p>

            </td>

            <td class="identity-photo">

                <div class="photo-wrapper">

                    <div class="photo-accent"></div>

                    <img
                        src="{{ $photo }}"
                        alt="Álvaro Jiménez Bustos"
                        class="photo"
                    >

                </div>

            </td>

        </tr>
    </table>

    {{-- CONTACTO --}}

    <table class="contact-bar">
        <tr>

            <td width="28%">
                <span class="contact-label">Email</span>

                <span class="contact-value">
                    alvarojbustos@gmail.com
                </span>
            </td>

            <td width="19%">
                <span class="contact-label">Teléfono</span>

                <span class="contact-value">
                    683 42 67 30
                </span>
            </td>

            <td width="22%">
                <span class="contact-label">Ubicación</span>

                <span class="contact-value">
                    Palma de Mallorca
                </span>
            </td>

            <td width="31%">
                <span class="contact-label">GitHub</span>

                <span class="contact-value">
                    github.com/AJBababa
                </span>
            </td>

        </tr>
    </table>

    {{-- 01 EXPERIENCIA --}}

    <section class="section">

        <table class="section-header">
            <tr>

                <td class="section-number">
                    01
                </td>

                <td class="section-title">
                    Experiencia
                </td>

                <td class="section-line">
                    <div></div>
                </td>

            </tr>
        </table>

        <table class="experience">

            {{-- PODARCIS --}}

            <tr class="experience-entry">

                <td class="experience-date">
                    2026<br>
                    ACTUALIDAD
                </td>

                <td class="experience-marker">
                    <div class="experience-marker-dot"></div>
                </td>

                <td class="experience-content">

                    <p class="experience-company">
                        Podarcis
                    </p>

                    <p class="experience-role">
                        Full-stack Developer
                    </p>

                    <p class="experience-description">
                        Desarrollo y mantenimiento de funcionalidades para aplicaciones
                        web y herramientas internas orientadas a procesos empresariales.
                    </p>

                    <ul class="experience-list">
                        <li>
                            Desarrollo de funcionalidades full-stack y mantenimiento
                            de aplicaciones existentes.
                        </li>

                        <li>
                            Implementación de interfaces, lógica de negocio y
                            tratamiento de datos en Laravel.
                        </li>

                        <li>
                            Maquetación y generación dinámica de documentos PDF
                            mediante Blade, HTML, CSS y dompdf.
                        </li>
                    </ul>

                </td>

            </tr>

            {{-- SYS / EL CORTE INGLÉS --}}

            <tr class="experience-entry">

                <td class="experience-date">
                    ABR — JUL<br>
                    2024
                </td>

                <td class="experience-marker">
                    <div class="experience-marker-dot"></div>
                </td>

                <td class="experience-content">

                    <p class="experience-company">
                        SYS / El Corte Inglés
                    </p>

                    <p class="experience-role">
                        Técnico de sistemas · FCT
                    </p>

                    <p class="experience-description">
                        Prácticas profesionales orientadas a soporte, mantenimiento
                        de equipos y resolución de incidencias informáticas.
                    </p>

                </td>

            </tr>

        </table>

    </section>

    {{-- 02 EDUCACIÓN / 03 STACK --}}

    <section class="section">

        <table class="info-grid">
            <tr>

                {{-- ================= EDUCACIÓN ================= --}}

                <td class="info-left">

                    <table class="section-header">
                        <tr>

                            <td class="section-number">
                                02
                            </td>

                            <td class="section-title">
                                Educación
                            </td>

                            <td class="section-line">
                                <div></div>
                            </td>

                        </tr>
                    </table>

                    <div class="education-entry">

                        <p class="education-title">
                            CFGS Desarrollo de Aplicaciones Web
                        </p>

                        <p class="education-meta">
                            Santa Mónica ·
                            <span class="education-year">
                                2024 — 2026
                            </span>
                        </p>

                    </div>

                    <div class="education-entry">

                        <p class="education-title">
                            CFGM Sistemas Microinformáticos y Redes
                        </p>

                        <p class="education-meta">
                            Santa Mónica ·
                            <span class="education-year">
                                2022 — 2024
                            </span>
                        </p>

                    </div>

                </td>

                {{-- ================= STACK ================= --}}

                <td class="info-right">

                    <table class="section-header">
                        <tr>

                            <td class="section-number">
                                03
                            </td>

                            <td class="section-title">
                                Stack
                            </td>

                            <td class="section-line">
                                <div></div>
                            </td>

                        </tr>
                    </table>

                    <table class="stack-table">

                        <tr>
                            <td class="stack-category">
                                Backend
                            </td>

                            <td class="stack-values">
                                <span class="stack-highlight">Laravel</span>,
                                PHP, Node.js, Express, REST APIs
                            </td>
                        </tr>

                        <tr>
                            <td class="stack-category">
                                Frontend
                            </td>

                            <td class="stack-values">
                                JavaScript, TypeScript, Angular,
                                Ionic, HTML, CSS
                            </td>
                        </tr>

                        <tr>
                            <td class="stack-category">
                                Data
                            </td>

                            <td class="stack-values">
                                PostgreSQL
                            </td>
                        </tr>

                        <tr>
                            <td class="stack-category">
                                Tools
                            </td>

                            <td class="stack-values">
                                Git, GitHub, Docker, Docker Compose
                            </td>
                        </tr>

                    </table>

                    <table class="languages">
                        <tr>
                            <td>

                                <span class="language">
                                    ES · Español
                                </span>

                                <span class="language">
                                    CA · Catalán
                                </span>

                                <span class="language">
                                    EN · Inglés
                                </span>

                            </td>
                        </tr>
                    </table>

                </td>

            </tr>
        </table>

    </section>

    {{-- 04 PROYECTOS --}}

    <section class="section">

        <table class="section-header">
            <tr>

                <td class="section-number">
                    04
                </td>

                <td class="section-title">
                    Proyectos seleccionados
                </td>

                <td class="section-line">
                    <div></div>
                </td>

            </tr>
        </table>

        <table class="projects">
            <tr>

                {{-- DUNGEO --}}

                <td class="project-left">

                    <div class="project">

                        <table class="project-top">
                            <tr>

                                <td class="project-number">
                                    01 /
                                </td>

                                <td class="project-title">
                                    Dungeo AI Adventure
                                </td>

                            </tr>
                        </table>

                        <p class="project-description">
                            RPG web interactivo con generación de contenido
                            mediante inteligencia artificial.
                        </p>

                        <div class="project-stack">
                            ANGULAR · IONIC · NODE.JS · GEMINI
                        </div>

                        <div class="project-link">
                            dungeeoo.web.app
                        </div>

                    </div>

                </td>

                {{-- MICROSERVICES --}}

                <td class="project-right">

                    <div class="project">

                        <table class="project-top">
                            <tr>

                                <td class="project-number">
                                    02 /
                                </td>

                                <td class="project-title">
                                    Microservices Social App
                                </td>

                            </tr>
                        </table>

                        <p class="project-description">
                            Aplicación social basada en una arquitectura de
                            microservicios contenerizada.
                        </p>

                        <div class="project-stack">
                            NODE.JS · POSTGRESQL · DOCKER
                        </div>

                        <div class="project-link">
                            github.com/AJBababa/microservices-social-app
                        </div>

                    </div>

                </td>

            </tr>
        </table>

    </section>

    {{-- FOOTER --}}

    <footer class="footer">

        <table class="footer-table">
            <tr>

                <td>
                    <span class="footer-accent">AJB</span>
                    &nbsp;/&nbsp; FULL-STACK DEVELOPER
                </td>

                <td class="footer-right">
                    PORTFOLIO · 2026
                </td>

            </tr>
        </table>

    </footer>

</div>

</body>

</html>