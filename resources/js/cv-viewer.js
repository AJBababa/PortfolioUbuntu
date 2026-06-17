// Lazily loads pdf.js and renders the CV the first time the window is opened.
// Loading on demand keeps pdf.js out of the main bundle and isolates any
// failure here from the rest of the app (terminal, window manager, etc.).
let started = false;

export const initCvViewer = async () => {
    if (started) {
        return;
    }
    started = true;

    const container = document.querySelector('#cvViewerContainer');
    const viewerEl = document.querySelector('#cvViewer');

    if (!container || !viewerEl) {
        return;
    }

    try {
        const pdfjsLib = await import('pdfjs-dist');
        const { EventBus, PDFLinkService, PDFViewer, LinkTarget } = await import('pdfjs-dist/web/pdf_viewer.mjs');
        await import('pdfjs-dist/web/pdf_viewer.css');
        const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url')).default;

        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        const eventBus = new EventBus();

        // externalLinkTarget = BLANK makes every link inside the PDF open in a new tab.
        const linkService = new PDFLinkService({
            eventBus,
            externalLinkTarget: LinkTarget.BLANK,
        });

        const pdfViewer = new PDFViewer({
            container,
            viewer: viewerEl,
            eventBus,
            linkService,
        });

        linkService.setViewer(pdfViewer);

        eventBus.on('pagesinit', () => {
            pdfViewer.currentScaleValue = 'page-width';
        });

        const pdfDocument = await pdfjsLib.getDocument({ url: container.dataset.pdfUrl }).promise;
        pdfViewer.setDocument(pdfDocument);
        linkService.setDocument(pdfDocument);
    } catch (error) {
        started = false;
        console.error('No se pudo cargar el CV:', error);
        container.innerHTML = '<p style="color:#f2f2f2;padding:16px;">No se pudo cargar el CV.</p>';
    }
};
