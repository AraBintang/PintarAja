<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Humanizer;
use Illuminate\Http\Request;

class HumanizerController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $results = Humanizer::select([
                'M_HumanizerID as id',
                'M_HumanizerName as name',
                'M_HumanizerData as data'
            ])
            ->where('M_HumanizerM_UserID', $user->M_UserID)
            ->orderByDesc('M_HumanizerID')
            ->get();

        return response()->json($results);
    }

    public function destroy($id)
    {
        $humanizer = Humanizer::findOrFail($id);

         if (!$humanizer) {
            return response()->json([
                'message' => 'Data not found.'
            ], 404);
        }

        $humanizer->delete();

        return response()->json([
            'message' => 'Deleted successfully'
        ]);
    }
}
