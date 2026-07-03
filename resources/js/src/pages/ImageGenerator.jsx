import React, { useState } from 'react';
import axios from 'axios';

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImage = async (e) => {
        e.preventDefault();
        if (!prompt) return;

        setLoading(true);
        setError('');
        setImageUrl('');

        try {
            const token = localStorage.getItem('token'); // Sesuaikan dengan cara Anda menyimpan token auth
            const response = await axios.post('/api/generate-image', { prompt }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.url) {
                setImageUrl(response.data.url);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal generate gambar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">AI Image Generator</h1>
            <p className="text-gray-600 mb-6">Tuliskan deskripsi gambar yang Anda inginkan, AI akan membuatnya untuk Anda.</p>

            <form onSubmit={generateImage} className="mb-8">
                <textarea
                    className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px] mb-4"
                    placeholder="Contoh: Seekor kucing astronot sedang makan pizza di bulan..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !prompt}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? 'Sedang membuat gambar (5-15 detik)...' : 'Generate Gambar'}
                </button>
            </form>

            {error && (
                <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {imageUrl && (
                <div className="border rounded-lg p-4 bg-gray-50 flex flex-col items-center">
                    <img src={imageUrl} alt={prompt} className="max-w-full h-auto rounded shadow-lg mb-4" />
                    <a
                        href={imageUrl}
                        download={`ai-image-${Date.now()}.png`}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Download Gambar
                    </a>
                </div>
            )}
        </div>
    );
};

export default ImageGenerator;
