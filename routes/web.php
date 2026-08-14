<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CvController;
use App\Http\Controllers\PortfolioController;

Route::get('/', [PortfolioController::class, 'index'])->name('portfolio.index');

// Detrás del comando oculto `generatecv` de la terminal.
Route::get('/cv/generate', [CvController::class, 'generate'])->name('cv.generate');
