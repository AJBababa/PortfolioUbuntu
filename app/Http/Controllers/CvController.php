<?php

namespace App\Http\Controllers;

use Barryvdh\DomPDF\Facade\Pdf;

class CvController extends Controller
{
    // Same dompdf setup as the Podarcis backoffice: A4 portrait, DejaVu Sans
    // (the only bundled font with full accent coverage) and remote assets on so
    // the template can pull images or a web font.
    //
    // Streams the PDF into a new tab: refresh to see the template changes, and
    // download it from there to replace public/files/cv-alvaro-jimenez.pdf.
    public function generate()
    {
        $pdf = Pdf::loadView('cv.document');

        $pdf->setPaper('A4', 'portrait');
        $pdf->setOptions([
            'defaultFont' => 'DejaVu Sans',
            'isPhpEnabled' => true,
            'isRemoteEnabled' => true,
        ]);

        return $pdf->stream('cv-alvaro-jimenez.pdf');
    }
}
