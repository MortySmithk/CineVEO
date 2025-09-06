import { NextResponse } from 'next/server';

// Esta é a nova função que busca os streams da API correta
async function fetchStreamsFromProvider(imdbId: string) {
    try {
        const response = await fetch('https://apiv2.metadrive.tv/api/v2/stream/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                type: 'movie',
                id: imdbId,
            }),
        });

        if (!response.ok) {
            console.error('API provider returned an error:', response.status);
            return null;
        }

        const data = await response.json();
        
        // Formata a resposta para o formato que o seu site espera
        const streams = (data.stream || []).map((s: any) => ({
            name: s.server,
            description: `${s.server} - ${s.language}`,
            url: s.url,
            behaviorHints: {
                proxyHeaders: {
                    request: {
                        Referer: data.player?.referer || '',
                        'User-Agent': data.player?.user_agent || 'Mozilla/5.0',
                    },
                },
            },
        }));

        return { streams };

    } catch (error) {
        console.error('Error fetching from provider API:', error);
        return null;
    }
}

export async function GET(
    request: Request,
    { params }: { params: { imdbId: string } }
) {
    const { imdbId } = params;

    try {
        // Agora chamamos a nova função que funciona!
        const data = await fetchStreamsFromProvider(imdbId);

        if (!data || !data.streams || data.streams.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'Nenhum stream encontrado para este filme.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Erro ao buscar stream para o filme ${imdbId}:`, error);
        return new NextResponse(
            JSON.stringify({ error: 'Falha ao buscar stream', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}