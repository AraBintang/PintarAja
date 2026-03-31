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

        foreach (iterator_to_array($dom->getElementsByTagName('*')) as $el) {
            $el->removeAttribute('style');
            $el->removeAttribute('class');
            $el->removeAttribute('data-colwidth');
            $el->removeAttribute('colwidth');
        }

        foreach (['li', 'th', 'td', 'tr', 'thead', 'tbody', 'table'] as $tag) {
            foreach (iterator_to_array($dom->getElementsByTagName($tag)) as $node) {
                foreach (iterator_to_array($node->childNodes) as $child) {
                    if ($child->nodeName === 'br') {
                        $node->removeChild($child);
                    }
                }
            }
        }

        foreach (['td', 'th'] as $cellTag) {
            foreach (iterator_to_array($dom->getElementsByTagName($cellTag)) as $cell) {
                $hasBlock = false;
                foreach ($cell->childNodes as $child) {
                    if ($child->nodeType === XML_ELEMENT_NODE && in_array($child->nodeName, ['p', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) {
                        $hasBlock = true;
                        break;
                    }
                }
                if (!$hasBlock) {
                    $p = $dom->createElement('p');
                    foreach (iterator_to_array($cell->childNodes) as $child) {
                        $cell->removeChild($child);
                        $p->appendChild($child);
                    }
                    $cell->appendChild($p);
                }
            }
        }

        foreach (iterator_to_array($dom->getElementsByTagName('tr')) as $tr) {
            $hasCells = false;
            foreach ($tr->childNodes as $child) {
                if ($child->nodeType === XML_ELEMENT_NODE && in_array($child->nodeName, ['td', 'th'])) {
                    $hasCells = true;
                    break;
                }
            }
            if (!$hasCells) {
                $tr->parentNode?->removeChild($tr);
            }
        }

        foreach (['thead', 'tbody', 'tfoot'] as $section) {
            foreach (iterator_to_array($dom->getElementsByTagName($section)) as $node) {
                $hasRows = false;
                foreach ($node->childNodes as $child) {
                    if ($child->nodeType === XML_ELEMENT_NODE && $child->nodeName === 'tr') {
                        $hasRows = true;
                        break;
                    }
                }
                if (!$hasRows) {
                    $node->parentNode?->removeChild($node);
                }
            }
        }

        foreach (iterator_to_array($dom->getElementsByTagName('table')) as $table) {
            $hasRows = $table->getElementsByTagName('tr')->length > 0;
            if (!$hasRows) {
                $table->parentNode?->removeChild($table);
            } else {
                $table->setAttribute('border', '1');
                $table->setAttribute('cellspacing', '0');
                $table->setAttribute('cellpadding', '4');
                $table->setAttribute('width', '100%');
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