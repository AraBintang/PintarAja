<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Workbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkbookController extends Controller
{
    public function index(Request $request)
    {
        $search  = $request->input('search');

        $user = $request->user();        

        $results = Workbook::select([
                'M_WorkbookID as id',
                'M_WorkbookName as name',
            ])
            ->where('M_WorkbookM_UserID', $user->M_UserID)
            ->when($search, function ($query, $search) {
                $query->where('M_WorkbookName', 'like', '%' . $search . '%');
            })
            ->get();

        return response()->json($results);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string',
        ]);

        $user = $request->user(); 

        try {
            $workbook = Workbook::create([
                'M_WorkbookName' => $validatedData['name'],
                'M_WorkbookM_UserID' => $user->M_UserID,
                'M_WorkbookCreated' => now(),
                'M_WorkbookLastUpdated' => now(),
            ]);

            return response()->json([
                'status' => true,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'status'  => false,
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Request $request)
    {
        $validated=$request->validate([
            'id'=>'required|integer|exists:m_workbook,M_WorkbookID',
        ]);

        try {
            DB::beginTransaction();

            $workbook=Workbook::where('M_WorkbookID',$validated['id'])
                ->first();

            if(!$workbook){
                DB::rollBack();

                return response()->json([
                    'message'=>'Workbook not found or already deleted.'
                ],404);
            }

            $hasDocument = Document::where('M_DocumentM_WorkbookID',$validated['id'])
                ->exists();

            if($hasDocument){
                DB::rollBack();
                
                return response()->json([
                    'message'=>'Workbook cannot be deleted because it is used by existing documents.'
                ],400);
            }

            $workbook->delete();

            DB::commit();

            return response()->json([
                'message'=>'Workbook deactivated successfully.'
            ],200);
        } catch(\Exception $e) {
            DB::rollBack();

            return response()->json([
            'message'=>'Error: '.$e->getMessage()
            ],500);
        }
    }
}
