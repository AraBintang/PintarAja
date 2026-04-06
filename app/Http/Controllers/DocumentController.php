<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
public function store(Request $request)
    {
        $validated = $request->validate([
            'userId' => 'required|integer',
            'workbookId' => 'required|integer',
            'name' => 'required|string',
            'promptData' => 'nullable',
            'fullPrompt' => 'nullable|string',
            'result' => 'required|string',
            'citations' => 'nullable|array',
            'citations.*.file_id' => 'nullable|string',
            'citations.*.filename' => 'nullable|string',
            'citations.*.index' => 'nullable|integer',
            'citations.*.paper' => 'nullable|string',
            'citations.*.section' => 'nullable|string',
            'citations.*.generatedAt' => 'nullable|string',
            'fileInfo' => 'nullable|array',
            'fileInfo.fileName' => 'nullable|string',
            'fileInfo.fileSize' => 'nullable|integer',
        ]);

        $document = Document::create([
            'M_DocumentM_UserID' => $validated['userId'],
            'M_DocumentM_WorkbookID' => $validated['workbookId'],
            'M_DocumentName' => $validated['name'],
            'M_DocumentPromptData' => isset($validated['promptData'])
                ? json_encode($validated['promptData'])
                : null,
            'M_DocumentFullPrompt' => $validated['fullPrompt'] ?? null,
            'M_DocumentResult' => $validated['result'],
            'M_DocumentCitations' => isset($validated['citations'])
                ? json_encode($validated['citations'])
                : null,
            'M_DocumentFileInfo' => isset($validated['fileInfo'])
                ? json_encode($validated['fileInfo'])
                : null,
            'M_DocumentCreated' => now(),
            'M_DocumentLastUpdated' => now(),
        ]);

        return response()->json([
            'message' => 'Document created',
            'id' => $document->M_DocumentID,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'workbookId' => 'required|integer',
            'name' => 'required|string',
            'promptData' => 'nullable',
            'fullPrompt' => 'nullable|string',
            'result' => 'required|string',
            'citations' => 'nullable|array',
            'citations.*.file_id' => 'nullable|string',
            'citations.*.filename' => 'nullable|string',
            'citations.*.index' => 'nullable|integer',
            'citations.*.paper'  => 'nullable|string',
            'citations.*.section' => 'nullable|string',
            'citations.*.generatedAt' => 'nullable|string',
            'fileInfo' => 'nullable|array',
            'fileInfo.fileName' => 'nullable|string',
            'fileInfo.fileSize' => 'nullable|integer',
        ]);

        $document->update([
            'M_DocumentM_WorkbookID' => $validated['workbookId'],
            'M_DocumentName' => $validated['name'],
            'M_DocumentPromptData' => isset($validated['promptData'])
                ? json_encode($validated['promptData'])
                : null,
            'M_DocumentFullPrompt' => $validated['fullPrompt'] ?? null,
            'M_DocumentResult' => $validated['result'],
            'M_DocumentCitations' => isset($validated['citations'])
                ? json_encode($validated['citations'])
                : null,
            'M_DocumentFileInfo' => isset($validated['fileInfo'])
                ? json_encode($validated['fileInfo'])
                : null,
            'M_DocumentLastUpdated' => now(),
        ]);

        return response()->json([
            'message' => 'Document updated',
            'id' => $document->M_DocumentID,
        ]);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);
        $document->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    public function download(Request $request)
    {
        $content = $request->input('content');

        if (empty($content)) {
            return response()->json(['error' => 'Content is empty'], 400);
        }

        $htmlFile = tempnam(sys_get_temp_dir(), 'pandoc_') . '.html';
        $docxFile = tempnam(sys_get_temp_dir(), 'pandoc_') . '.docx';

        $fullHtml = '<!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body>' . $content . '</body>
    </html>';

        file_put_contents($htmlFile, $fullHtml);

        $command = sprintf(
            'pandoc %s -f html -t docx -o %s 2>&1',
            escapeshellarg($htmlFile),
            escapeshellarg($docxFile)
        );

        exec($command, $output, $exitCode);

        unlink($htmlFile);

        if ($exitCode !== 0 || !file_exists($docxFile)) {
            \Log::error('Pandoc failed', ['output' => $output, 'exit' => $exitCode]);
            return response()->json(['error' => 'Conversion failed', 'detail' => $output], 500);
        }

        $fileName = 'GeneratedDocument_' . time() . '.docx';

        return response()->streamDownload(function () use ($docxFile) {
            readfile($docxFile);
            unlink($docxFile);
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }
}