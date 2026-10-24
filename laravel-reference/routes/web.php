<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Computer Vision Laboratory — Laravel + Inertia.js Routes
|--------------------------------------------------------------------------
|
| These routes map each URL to an Inertia page component.
| The component name (second argument of Inertia::render) must match the
| file path under resources/js/Pages/ — e.g. 'Labs/Lab2EdgeDetection'
| resolves to resources/js/Pages/Labs/Lab2EdgeDetection.jsx
|
*/

// Home / Dashboard
Route::get('/', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

// ── Laboratory Activity Routes ─────────────────────────────────────────────

Route::prefix('lab')->name('lab.')->group(function () {

    Route::get('/images', function () {
        return Inertia::render('Labs/Lab1');
    })->name('images');

    Route::get('/edge-detection', function () {
        return Inertia::render('Labs/Lab2EdgeDetection');
    })->name('edge-detection');

    Route::get('/histogram', function () {
        return Inertia::render('Labs/Lab3Histogram');
    })->name('histogram');

    Route::get('/surf', function () {
        return Inertia::render('Labs/Lab4Surf');
    })->name('surf');

    Route::get('/pca', function () {
        return Inertia::render('Labs/Lab5Pca');
    })->name('pca');

    Route::get('/yolov8', function () {
        return Inertia::render('Labs/Lab6Yolov8');
    })->name('yolov8');

    Route::get('/segmentation', function () {
        return Inertia::render('Labs/Lab7Segmentation');
    })->name('segmentation');

});
