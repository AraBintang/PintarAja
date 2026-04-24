<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\WebSetting;
use Illuminate\Http\Request;

class WebSettingController extends Controller
{
    public function index()
    {
        $settings = WebSetting::orderBy('M_WebSettingID')->get()->map(fn($s) => [
            'id' => $s->M_WebSettingID,
            'key' => $s->M_WebSettingKey,
            'label' => $s->M_WebSettingLabel,
            'value' => $s->M_WebSettingValue,
        ]);

        return response()->json(['data' => $settings]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'key' => 'required|string',
            'label' => 'nullable|string',
            'value' => 'nullable|string',
        ]);

        if ($request->key === 'whatsapp_number') {
            $exists = WebSetting::where('M_WebSettingKey', 'whatsapp_number')->exists();
            if ($exists) {
                return response()->json(['message' => 'Whatsapp number already exists, please edit instead.'], 422);
            }
        }

        $setting = WebSetting::create([
            'M_WebSettingKey' => $request->key,
            'M_WebSettingLabel' => $request->label,
            'M_WebSettingValue' => $request->value,
        ]);

        return response()->json(['data' => [
            'id' => $setting->M_WebSettingID,
            'key' => $setting->M_WebSettingKey,
            'label' => $setting->M_WebSettingLabel,
            'value' => $setting->M_WebSettingValue,
        ]], 201);
    }

    public function update(Request $request, $id)
    {
        $setting = WebSetting::findOrFail($id);

        $request->validate([
            'key' => 'required|string',
            'label' => 'nullable|string',
            'value' => 'nullable|string',
        ]);

        $setting->update([
            'M_WebSettingKey' => $request->key,
            'M_WebSettingLabel' => $request->label,
            'M_WebSettingValue' => $request->value,
        ]);

        return response()->json(['data' => [
            'id' => $setting->M_WebSettingID,
            'key' => $setting->M_WebSettingKey,
            'label' => $setting->M_WebSettingLabel,
            'value' => $setting->M_WebSettingValue,
        ]]);
    }

    public function destroy($id)
    {
        WebSetting::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function public()
    {
        $settings = WebSetting::all()->groupBy('M_WebSettingKey')->map(function ($group) {
            return $group->map(fn($s) => [
                'id' => $s->M_WebSettingID,
                'label' => $s->M_WebSettingLabel,
                'value' => $s->M_WebSettingValue,
            ])->values();
        });

        return response()->json($settings);
    }
}
