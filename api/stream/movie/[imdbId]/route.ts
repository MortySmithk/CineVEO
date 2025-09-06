import { NextResponse } from 'next/server';
import { load } from 'cheerio'; // Você talvez precise instalar: npm install cheerio

// Função que busca os streams da fonte externa (ex: Netcinex)
async function fetchStreamsFromProvider(imdbId: string) {
    // Exemplo de como seu backend pode estar fazendo isso
    // IMPORTANTE: Adapte esta lógica para ser igual à do seu localhost:3001
    const response = await fetch(`https://netcinex.lat/filme/${imdbId}`, {
        headers: {
            'Referer': 'https://netcinex.lat/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch from provider');
    }

    const html = await response.text();
    const $ = load(html);

    // Lógica para extrair os links do HTML (exemplo hipotético)
    // Você precisa inspecionar o HTML da página e adaptar o seletor
    const streams: any[] = [];
    $('iframe').each((i, el) => {
        const src = $(el).attr('src');
        if (src) {
             // Lógica para extrair e formatar os streams
             // O resultado final deve ser parecido com o seu arquivo api.txt
        }
    });

    // Se a lógica acima for muito complexa, você pode precisar de outra abordagem.
    // Por enquanto, vamos retornar um erro amigável.
    // O ideal é implementar a busca real aqui.

    // Apenas para teste, vamos simular que não encontrou
    if (streams.length === 0) {
        // Se você tem outra API que retorna o JSON direto, chame ela aqui.
        // Ex: const providerResponse = await fetch(`https://api-externa.com/movie/${imdbId}`);
        // return await providerResponse.json();
    }
    
    return { streams };
}


export async function GET(
    request: Request,
    { params }: { params: { imdbId: string } }
) {
    const { imdbId } = params;

    try {
        // Removido a chamada para localhost e substituído pela lógica direta
        const data = await fetchStreamsFromProvider(imdbId);

        // Se a busca não retornar nada, informe o usuário
        if (!data || !data.streams || data.streams.length === 0) {
            return new NextResponse(
                JSON.stringify({ error: 'No streams found for this movie.' }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`Error fetching stream for movie ${imdbId}:`, error);
        return new NextResponse(
            JSON.stringify({ error: 'Failed to fetch stream', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}