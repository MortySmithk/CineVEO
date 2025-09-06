import { NextResponse } from 'next/server';
import { load } from 'cheerio'; // Você talvez precise instalar: npm install cheerio

// Função que busca os streams de séries da fonte externa
async function fetchSeriesStreamsFromProvider(imdbId: string, season: string, episode: string) {
    // Lógica similar à de filmes, mas para séries
    // Adapte a URL e a lógica de extração conforme necessário
    const response = await fetch(`https://netcinex.lat/serie/${imdbId}/${season}/${episode}`, {
         headers: {
            'Referer': 'https://netcinex.lat/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch series from provider');
    }
    
    // ... Lógica para extrair os dados da página HTML ...
    const streams: any[] = [];
    
    return { streams };
}


export async function GET(
    request: Request,
    { params }: { params: { params: string[] } }
) {
    const [imdbId, season, episode] = params.params;

    if (!imdbId || !season || !episode) {
        return new NextResponse(
            JSON.stringify({ error: 'Missing required parameters: imdbId, season, episode' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const data = await fetchSeriesStreamsFromProvider(imdbId, season, episode);

        if (!data || !data.streams || data.streams.length === 0) {
             return new NextResponse(
                JSON.stringify({ error: 'No streams found for this episode.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Error fetching stream for series ${imdbId} S${season}E${episode}:`, error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch stream', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}