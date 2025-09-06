import { NextResponse } from 'next/server';

// Nova função para buscar streams de séries
async function fetchSeriesStreamsFromProvider(imdbId: string, season: string, episode: string) {
    try {
        const response = await fetch('https://apiv2.metadrive.tv/api/v2/stream/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                type: 'series',
                id: imdbId,
                s: season,
                e: episode,
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
    { params }: { params: { params: string[] } }
) {
    const [imdbId, season, episode] = params.params;

    if (!imdbId || !season || !episode) {
        return new NextResponse(
            JSON.stringify({ error: 'Faltando parâmetros: imdbId, season, episode' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const data = await fetchSeriesStreamsFromProvider(imdbId, season, episode);

        if (!data || !data.streams || data.streams.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'Nenhum stream encontrado para este episódio.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Erro ao buscar stream para a série ${imdbId} S${season}E${episode}:`, error);
        return new NextResponse(
            JSON.stringify({ error: 'Falha ao buscar stream', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}