<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Document;
use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\Shared\Html;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $page = max(1, (int) $request->input('page', 1));
        $search = $request->input('search');
        $workbook = $request->input('workbook');

        $query = Document::query()
            ->when($search, function ($q) use ($search) {
                $q->where('M_DocumentName', 'like', "%{$search}%");
            })
            ->when($workbook, function ($q) use ($workbook) {
                $q->where('M_DocumentM_WorkbookID', $workbook);
            })
            ->orderBy('M_DocumentCreated', 'desc');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        return response()->json([
            'data' => $paginated->items(),
            'pagination' => [
                'current_page' => $paginated->currentPage(),
                'per_page' => $paginated->perPage(),
                'total' => $paginated->total(),
                'last_page' => $paginated->lastPage()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'userId' => 'required|integer',
            'workbookId' => 'required|integer',
            'name' => 'required|string',
            'topicId' => 'nullable|integer',
            'fullPrompt' => 'nullable|string',
            'result' => 'required|string'
        ]);

        $document = Document::create([
            'M_DocumentM_UserID' => $validated['userId'],
            'M_DocumentM_WorkbookID' => $validated['workbookId'],
            'M_DocumentName' => $validated['name'],
            'M_DocumentM_TopicID' => $validated['topicId'] ?? 0,
            'M_DocumentFullPrompt' => $validated['fullPrompt'] ?? null,
            'M_DocumentResult' => $validated['result'],
            'M_DocumentCreated' => now(),
            'M_DocumentLastUpdated' => now()
        ]);

        return response()->json([
            'message' => 'Document created',
            'data' => $document
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $document = Document::findOrFail($id);

        $validated = $request->validate([
            'workbookId' => 'required|integer',
            'name' => 'required|string',
            'topicId' => 'nullable|integer',
            'fullPrompt' => 'nullable|string',
            'result' => 'required|string'
        ]);

        $document->update([
            'M_DocumentM_WorkbookID' => $validated['workbookId'],
            'M_DocumentName' => $validated['name'],
            'M_DocumentM_TopicID' => $validated['topicId'] ?? 0,
            'M_DocumentFullPrompt' => $validated['fullPrompt'] ?? null,
            'M_DocumentResult' => $validated['result'],
            'M_DocumentLastUpdated' => now()
        ]);

        return response()->json([
            'message' => 'Document updated',
            'data' => $document
        ]);
    }

    public function download(Request $request)
    {
        $content = $request->input('content');
    
        if (empty($content)) {
            return response()->json(['error' => 'Content is empty'], 400);
        }
    
        $phpWord = new PhpWord();
        $section = $phpWord->addSection();
        Html::addHtml($section, $content);
    
        $fileName = 'GeneratedDocument_' . time() . '.docx';
        $headers = [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];
    
        $tempFile = tempnam(sys_get_temp_dir(), 'phpword');
        $phpWord->save($tempFile, 'Word2007');
    
        return response()->streamDownload(function () use ($tempFile) {
            readfile($tempFile);
            unlink($tempFile);
        }, $fileName, $headers);
    }

    public function destroy($id)
    {
        $document = Document::findOrFail($id);

        if (!$document) {
            return response()->json([
                'message' => 'Data not found.'
            ], 404);
        }

        $document->delete();

        return response()->json([
            'message' => 'Document deleted'
        ]);
    }
}
