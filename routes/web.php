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
| file path under resources/js/Pages/ — e.g. 'Labs/Lab1'
| resolves to resources/js/Pages/Labs/Lab1.jsx
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
        return Inertia::render('Labs/Lab2');
    })->name('edge-detection');

    Route::get('/histogram', function () {
        return Inertia::render('Labs/Lab3');
    })->name('histogram');

    Route::get('/surf', function () {
        return Inertia::render('Labs/Lab4');
    })->name('surf');

    Route::get('/surf-features', function () {
        return Inertia::render('Labs/Lab4');
    })->name('surf-features');

    Route::get('/pca-eigenfaces', function () {
        return Inertia::render('Labs/Lab5');
    })->name('pca-eigenfaces');

    Route::get('/pca', function () {
        return Inertia::render('Labs/Lab5');
    })->name('pca');

    Route::get('/yolov11', function () {
        return Inertia::render('Labs/Lab6');
    })->name('yolov11');

    Route::get('/segmentation', function () {
        return Inertia::render('Labs/Lab7');
    })->name('segmentation');

});
