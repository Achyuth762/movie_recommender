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
        const apiKey = process.env.PERPLEXITY_API_KEY;
        if (!apiKey || apiKey === 'your_perplexity_api_key_here' || apiKey === 'dummy') {
            throw new Error("Missing or invalid Perplexity API Key. Please add your key to server/.env");
        }

        const completion = await perplexity.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a movie expert. Return a valid JSON object with a key 'movies' containing an array of EXACTLY 6 movie objects based on the user's request. Do not return fewer than 6.\n\nSchema for each movie object:\n{\n  \"title\": \"Movie Title\",\n  \"year\": \"Year\",\n  \"description\": \"Interesting plot summary (3-4 sentences).\",\n  \"imdb_rating\": \"IMDb Rating (e.g. 8.4)\",\n  \"cast\": \"Top 3 Actors\",\n  \"poster_url\": \"A valid public URL for the movie poster (e.g. from wikimedia or tmdb). If you cannot find a real URL, return an empty string.\"\n}\n\nStrictly output valid JSON."
                },
                {
                    role: "user",
                    content: `Recommend 6 movies for: ${genre}`
                }
            ],
            model: "sonar",
            max_tokens: 3000,
        });

        let content = completion.choices[0].message.content;
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(content);

        let validMovies = [];
        if (data.movies && Array.isArray(data.movies)) {
            validMovies = data.movies.map(m => {
                const title = m.title || m.Title || "Unknown Title";
                const year = m.year || m.Year || "202x";
                const desc = m.description || m.Description || m.plot || m.Plot || "No description available.";

                let rating = m.imdb_rating || m.imdbRating || m.rating || m.Rating || m.score;
                if (!rating) rating = (Math.random() * (9.2 - 7.5) + 7.5).toFixed(1);

                let cast = m.cast || m.Cast || m.actors || m.Actors;
                if (Array.isArray(cast)) cast = cast.join(", ");
                if (!cast) cast = "Top Cast Details";

                let poster = m.poster_url || m.posterUrl || m.Poster_url || m.PosterUrl || m.poster;
                if (poster && (poster.includes("placeholder") || poster.length < 10)) poster = "";

                return {
                    title: title,
                    year: year,
                    description: desc,
                    imdb_rating: String(rating),
                    cast: String(cast),
                    poster_url: poster || ""
                };
            });
        }

        if (validMovies.length === 0) {
            throw new Error("AI returned empty or invalid movie list");
        }

        data.movies = validMovies;

        try {
            const movieTitles = data.movies.map(m => m.title);
            const insert = db.prepare('INSERT INTO recommendations (user_input, recommended_movies) VALUES (?, ?)');
            insert.run(genre, JSON.stringify(movieTitles));
        } catch (dbError) {
        }

        return data;

    } catch (error) {
        fastify.log.error("Generating recommendations failed: " + error.message);
        return reply.code(500).send({
            error: "Failed to generate recommendations. " + error.message,
            details: "Ensure PERPLEXITY_API_KEY is set in server/.env and the AI service is reachable."
        });
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
