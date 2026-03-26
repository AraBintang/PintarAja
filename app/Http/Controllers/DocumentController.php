<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use Illuminate\Http\Request;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;

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
            'id'      => $document->M_DocumentID,
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
            'citations'   => 'nullable|array',
            'citations.*.file_id' => 'nullable|string',
            'citations.*.filename' => 'nullable|string',
            'citations.*.index' => 'nullable|integer',
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

        $content = $this->sanitizeForPhpWord($content);
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        Html::addHtml($section, $content);

        $fileName = 'GeneratedDocument_' . time() . '.docx';
        $tempFile = tempnam(sys_get_temp_dir(), 'phpword');
        $phpWord->save($tempFile, 'Word2007');

        return response()->streamDownload(function () use ($tempFile) {
            readfile($tempFile);
            unlink($tempFile);
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    private function sanitizeForPhpWord(string $html): string
    {
        libxml_use_internal_errors(true);
        $dom = new \DOMDocument('1.0', 'UTF-8');
        $dom->loadHTML(
            '<html><body>' . $html . '</body></html>',
            LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD
        );
        libxml_clear_errors();

        $tagsToClean = ['li', 'th', 'td', 'tr', 'thead', 'tbody', 'table'];
        foreach ($tagsToClean as $tag) {
            foreach ($dom->getElementsByTagName($tag) as $node) {
                foreach (iterator_to_array($node->childNodes) as $child) {
                    if ($child->nodeName === 'br') {
                        $node->removeChild($child);
                    }
                }
            }
        }

        foreach (iterator_to_array($dom->getElementsByTagName('p')) as $p) {
            $inner = trim($p->textContent);
            $hasBrOnly = $p->childNodes->length === 1 && $p->childNodes->item(0)->nodeName === 'br';
            if ($inner === '' || $hasBrOnly) {
                $p->parentNode?->removeChild($p);
            }
        }

        $body = $dom->getElementsByTagName('body')->item(0);
        $result = '';
        foreach ($body->childNodes as $child) {
            $result .= $dom->saveHTML($child);
        }

        return $result;
    }
}