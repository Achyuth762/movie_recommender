const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const OpenAI = require('openai');
require('dotenv').config();
const db = require('./db');

fastify.register(cors, {
    origin: '*'
});


const perplexity = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY || 'dummy',
    baseURL: 'https://api.perplexity.ai'
});

fastify.post('/recommend', async (request, reply) => {
    const { genre } = request.body;

    if (!genre) {
        return reply.code(400).send({ error: "Genre/Preference is required" });
    }

    try {
        if (!process.env.PERPLEXITY_API_KEY || process.env.PERPLEXITY_API_KEY === 'your_perplexity_api_key_here') {
            throw new Error("Missing Perplexity API Key");
        }


        const completion = await perplexity.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a movie expert. Return a valid JSON object with a key 'movies' containing an array of 3-5 movie objects. Schema: { title: string, year: string, description: string }. NO markdown, NO code blocks, just raw JSON. Ensure descriptions are catchy."
                },
                {
                    role: "user",
                    content: `Recommend movies for: ${genre}`
                }
            ],
            model: "sonar",
            max_tokens: 1000,
        });

        let content = completion.choices[0].message.content;


        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const data = JSON.parse(content);


        const movieTitles = data.movies.map(m => m.title);
        const insert = db.prepare('INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)');
        insert.run(genre, JSON.stringify(movieTitles));

        return data;

    } catch (error) {
        fastify.log.error(error);


        const mockMovies = [
            { title: "Inception", year: "2010", description: "A thief who steals corporate secrets through the use of dream-sharing technology." },
            { title: "Interstellar", year: "2014", description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival." },
            { title: "The Grand Budapest Hotel", year: "2014", description: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge." },
            { title: "Spider-Man: Into the Spider-Verse", year: "2018", description: "Teen Miles Morales becomes the Spider-Man of his universe, and must join with five spider-powered individuals from other dimensions to stop a threat for all realities." }
        ];


        try {
            const movieTitles = mockMovies.map(m => m.title);
            const insert = db.prepare('INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)');
            insert.run(genre, JSON.stringify(movieTitles));
        } catch (dbErr) {
            fastify.log.error(dbErr);
        }

        return {
            movies: mockMovies,
            note: "Using mock data. Please set PERPLEXITY_API_KEY in server/.env for real AI recommendations.",
            debug_error: error.message
        };
    }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running at http://localhost:3000');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();
