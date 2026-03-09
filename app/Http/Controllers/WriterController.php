<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Paper;
use App\Models\Prompt;
use App\Models\Section;
use App\Models\Workbook;
use App\Services\AiProviderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WriterController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'User authentication failed.'
            ],401);
        }

        $papers = Paper::select(
            'M_PaperID as id',
            'M_PaperName as name'
        )->orderBy('M_PaperName')->get();

        $sections = Section::select(
            'M_SectionID as id',
            'M_SectionName as name'
        )->orderBy('M_SectionName')->get();

        $prompts = Prompt::select(
            'M_PromptID as id',
            'M_PromptName as name',
            'M_PromptValue as value'
        )->orderBy('M_PromptName')->get();

        $aiProviders = DB::table('m_plansetting as ps')
            ->join('m_setting as s','s.M_SettingID','=','ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID',$user->M_UserPlan)
            ->where('s.M_SettingIsActive','Y')
            ->select(
                's.M_SettingID as id',
                's.M_SettingCode as code',
                's.M_SettingModel as model'
            )
            ->get();

        $workbooks = Workbook::where('M_WorkbookM_UserID',$user->M_UserID)
            ->select(
                'M_WorkbookID as id',
                'M_WorkbookName as name'
            )
            ->orderBy('M_WorkbookName')
            ->get();

        $documents = Document::where('M_DocumentM_UserID',$user->M_UserID)
            ->leftJoin('m_workbook','m_workbook.M_WorkbookID','=','m_document.M_DocumentM_WorkbookID')
            ->select(
                'm_document.M_DocumentID as id',
                'm_document.M_DocumentName as title',
                'm_workbook.M_WorkbookName as workbook',
                'm_document.M_DocumentLastUpdated as lastEdited'
            )
            ->orderBy('m_document.M_DocumentLastUpdated','desc')
            ->limit(20)
            ->get();

        return response()->json([
            'papers'=>$papers,
            'sections'=>$sections,
            'prompts'=>$prompts,
            'ai'=>$aiProviders,
            'workbooks'=>$workbooks,
            'documents'=>$documents
        ]);
    }

    public function generate(Request $request, AiProviderService $aiService)
    {
        $request->validate([
            'providerId'=>'required|integer',
            'message'=>'required|string'
        ]);

        $user = $request->user();

        if(!$user){
            return response()->json([
                'message'=>'User authentication failed.'
            ],401);
        }

        $provider = DB::table('m_plansetting as ps')
            ->join('m_setting as s','s.M_SettingID','=','ps.M_PlanSettingM_SettingID')
            ->where('ps.M_PlanSettingM_PlanID',$user->M_UserPlan)
            ->where('s.M_SettingID',$request->providerId)
            ->where('s.M_SettingIsActive','Y')
            ->select(
                's.M_SettingCode',
                's.M_SettingModel',
                's.M_SettingKey'
            )
            ->first();

        if(!$provider){
            return response()->json([
                'message'=>'You are not allowed to use this AI provider with your current subscription plan.'
            ],403);
        }

        if(empty($provider->M_SettingKey)){
            return response()->json([
                'message'=>'AI provider configuration is missing API key.'
            ],500);
        }

        $providerMap=[
            'SETTING-GPT'=>'OpenAI',
            'SETTING-CLD'=>'Claude',
            'SETTING-GMN'=>'Gemini',
            'SETTING-DSK'=>'DeepSeek',
            'SETTING-QWN'=>'Qwen'
        ];

        $aiName=$providerMap[$provider->M_SettingCode] ?? null;

        if(!$aiName){
            return response()->json([
                'message'=>'Unknown AI provider configuration.'
            ],400);
        }

        try{
            $handlers=[
                'OpenAI'=>fn()=> $aiService->streamOpenAI($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'Gemini'=>fn()=> $aiService->streamGemini($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'DeepSeek'=>fn()=> $aiService->streamDeepSeek($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'Claude'=>fn()=> $aiService->streamClaude($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true),
                'Qwen'=>fn()=> $aiService->streamQwen($provider->M_SettingKey, $provider->M_SettingModel, $request->message, true)
            ];

            if(!isset($handlers[$aiName])){
                return response()->json([
                    'message'=>"AI handler for {$aiName} is not implemented."
                ],500);
            }

            return $handlers[$aiName]();
        }catch(\Exception $e){
            return response()->json([
                'message'=>'AI request failed.',
                'error'=>$e->getMessage()
            ],500);
        }
    }
}