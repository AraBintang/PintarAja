<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::first();
if ($user) {
    $query = \App\Models\UserFile::where('M_UserFileM_UserID', $user->M_UserID);
    echo "UserFiles: " . count($query->get()) . "\n";
    $docs = \App\Models\Document::where('M_DocumentM_UserID', $user->M_UserID)->count();
    echo "Documents: " . $docs . "\n";
}
