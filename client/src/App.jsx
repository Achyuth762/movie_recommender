import { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [collection, setCollection] = useState(() => {
    try {
      const saved = localStorage.getItem('cineSuggest_collection');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setLoading(true)
    setError(null)
    setMovies([])

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/recommend`, {
        genre: prompt
      })

      const data = response.data;
      if (data.movies && Array.isArray(data.movies)) {
        setMovies(data.movies)
      } else {
        setMovies([])
      }

    } catch (err) {
      console.error(err)
      setError("Unable to connect to the recommendation engine. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  const [showCollection, setShowCollection] = useState(false);

  const updateCollection = (newCollection) => {
    setCollection(newCollection);
    localStorage.setItem('cineSuggest_collection', JSON.stringify(newCollection));
  };

  const toggleCollectionItem = (movie) => {
    const exists = collection.find(m => m.title === movie.title);
    if (exists) {
      updateCollection(collection.filter(m => m.title !== movie.title));
    } else {
      updateCollection([...collection, movie]);
    }
  };

  return (
    <div className="app-root">
      <nav className="top-nav">
        <div className="logo" onClick={() => setShowCollection(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-icon">
            <rect x="2" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16L22 19V5L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          CINESUGGEST
        </div>
        <button className={`nav-btn ${showCollection ? 'active' : ''}`} onClick={() => setShowCollection(!showCollection)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path><path d="m3.3 7 8.7 5 8.7-5"></path><path d="M12 22v-9"></path></svg>
          MY COLLECTION ({collection.length})
        </button>
      </nav>

      <div className="container">
        {!showCollection ? (
          <>
            <header className="hero">
              <h1>STOP SEARCHING.<br />START WATCHING.</h1>
              <p>Your personal AI film curator. Tell us what you're in the mood for.</p>
            </header>

            <main>
              <form onSubmit={handleSubmit} className="search-box">
                <input
                  type="text"
                  placeholder="e.g. 'Cyberpunk anime with philosophical themes' or '90s RomCom'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !prompt} className="generate-btn">
                  {loading ? <span className="loader"></span> : 'CURATE →'}
                </button>
              </form>

              {error && <div className="error-msg">{error}</div>}

              <div className="movie-grid">
                {movies.map((movie, index) => {
                  const isSaved = collection.some(m => m.title === movie.title);
                  return (
                    <article
                      className="movie-card"
                      key={index}
                      onClick={() => setSelectedMovie(movie)}
                      style={{
                        animationDelay: `${index * 0.15}s`
                      }}
                    >
                      <div className="movie-content">
                        <header className="movie-header">
                          <h2>{movie.title}</h2>
                          <button
                            className={`save-btn ${isSaved ? 'saved' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCollectionItem(movie);
                            }}
                            title={isSaved ? "Remove from collection" : "Add to collection"}
                          >
                            {isSaved ? '♥' : '♡'}
                          </button>
                        </header>
                        <div className="meta-tags">
                          <span className="year">{movie.year}</span>
                          <span className="rating">★ {movie.imdb_rating || "8.1"}</span>
                        </div>
                        <p className="description line-clamp">{movie.description}</p>
                        <div className="card-footer">
                          <button className="watch-btn">More Details</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {!loading && movies.length === 0 && !error && (
                <div className="empty-state">
                  <p>Start by typing a genre, mood, or plot idea above.</p>
                </div>
              )}
            </main>
          </>
        ) : (
          <main className="collection-view">
            <button className="back-btn" onClick={() => setShowCollection(false)}>
              ← Back to Search
            </button>

            <header className="hero" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <h1>MY<br />COLLECTION.</h1>
            </header>

            {collection.length === 0 ? (
              <div className="empty-state">
                <p>No movies saved yet. Go back to search and add some!</p>
                <button className="generate-btn" style={{ marginTop: '1rem' }} onClick={() => setShowCollection(false)}>
                  Discover Movies
                </button>
              </div>
            ) : (
              <div className="movie-grid">
                {collection.map((movie, index) => (
                  <article
                    className="movie-card"
                    key={index}
                    onClick={() => setSelectedMovie(movie)}
                  >
                    <div className="movie-content">
                      <header className="movie-header">
                        <h2>{movie.title}</h2>
                        <button
                          className="save-btn saved"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCollectionItem(movie);
                          }}
                          title="Remove from collection"
                        >
                          ♥
                        </button>
                      </header>
                      <div className="meta-tags">
                        <span className="year">{movie.year}</span>
                        <span className="rating">★ {movie.imdb_rating || "8.1"}</span>
                      </div>
                      <p className="description line-clamp">{movie.description}</p>
                      <div className="card-footer">
                        <button className="watch-btn">More Details</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        )}
      </div>

      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setSelectedMovie(null)}>×</button>

            <header className="modal-header">
              <h2>{selectedMovie.title}</h2>
              <div className="meta-row">
                <span className="year-badge">{selectedMovie.year}</span>
                {selectedMovie.imdb_rating && <span className="rating-badge">IMDb {selectedMovie.imdb_rating}</span>}
              </div>
            </header>

            <div className="modal-body">
              <p className="modal-description">{selectedMovie.description}</p>

              {selectedMovie.cast && (
                <div className="cast-section">
                  <h3>Cast</h3>
                  <p>{selectedMovie.cast}</p>
                </div>
              )}

              <div className="modal-actions">
                <button
                  className={`primary-action-btn ${collection.some(m => m.title === selectedMovie.title) ? 'saved' : ''}`}
                  onClick={() => toggleCollectionItem(selectedMovie)}
                >
                  {collection.some(m => m.title === selectedMovie.title) ? 'Saved to Collection' : 'Add to Collection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="main-footer">
        <div className="footer-content">
          <div className="footer-section branding">
            <h4>CineSuggest</h4>
            <p>AI-powered movie curator for the modern era.</p>
          </div>
          <div className="footer-section">
            <h4>Links</h4>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowCollection(false); }}>Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowCollection(true); }}>My Collection</a>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
          <div className="footer-section">
            <h4>Connect</h4>
            <a href="#">Twitter</a>
            <a href="#">GitHub</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 CineSuggest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
