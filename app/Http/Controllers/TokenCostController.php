<?php

namespace App\Http\Controllers;

use App\Services\TokenDeductionService;
use Illuminate\Http\Request;

class TokenCostController extends Controller
{
    protected TokenDeductionService $tokenDeductionService;

    public function __construct(TokenDeductionService $tokenDeductionService)
    {
        $this->tokenDeductionService = $tokenDeductionService;
    }

    public function index()
    {
        $costs = $this->tokenDeductionService->getAllCosts();
        return response()->json(['data' => $costs]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'cost_chat' => 'integer|min:0',
            'cost_image_generator' => 'integer|min:0',
            'cost_video_generator' => 'integer|min:0',
            'cost_writer' => 'integer|min:0',
            'cost_humanizer' => 'integer|min:0',
            'cost_paraphrase' => 'integer|min:0',
            'cost_transcribe' => 'integer|min:0',
            'cost_topup_amount' => 'integer|min:1',
            'cost_topup_price' => 'integer|min:0',
        ]);

        $this->tokenDeductionService->updateCosts($request->all());

        return response()->json([
            'message' => 'Token costs updated successfully.',
            'data' => $this->tokenDeductionService->getAllCosts()
        ]);
    }
}
