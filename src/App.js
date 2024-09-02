import { useEffect, useRef, useState } from "react";
import StarRating from "./components/StarRating";
import useMovies from "./customHooks/usemovies";

const KEY = "6f4d1dd6";
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function MovieList({ movies, setSelectedMovie }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} setSelectedMovie={setSelectedMovie} />
      ))}
    </ul>
  );
}

function Movie({ movie, setSelectedMovie }) {
  return (
    <li key={movie.imdbID} onClick={() => setSelectedMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓 </span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function WatchedSummary({ watched }) {
  const avgImdbRating = average(
    watched.map((movie) => movie.imdbRating)
  ).toFixed(2);
  const avgUserRating = average(
    watched.map((movie) => movie.userRating)
  ).toFixed(2);
  const avgRuntime = average(
    watched.map((movie) => Number(movie.runtime.split(" ")[0]))
  );
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMovieList({ watched, handleRemoveWatchedMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          handleRemoveWatchedMovie={handleRemoveWatchedMovie}
        />
      ))}
    </ul>
  );
}
function WatchedMovie({ movie, handleRemoveWatchedMovie }) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime}</span>
        </p>
        <button
          className="remove--btn"
          onClick={() => handleRemoveWatchedMovie(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

function MovieDetails({
  MovieId,
  setSelectedMovie,
  handleTempMovieAdd,
  watched,
}) {
  const [isLoading, setisLoading] = useState(false);
  const [movieData, setMovieData] = useState({});
  const [rating, setRating] = useState(null);

  const watchedMovie = watched.filter((watched) => watched.imdbID === MovieId);
  const UserRating = watchedMovie[0]?.userRating;

  useEffect(
    function () {
      if (!movieData.Title) return;
      document.title = `UsePopcorn | ${movieData.Title}`;
      return function () {
        document.title = "usePopcorn";
      };
    },
    [movieData.Title]
  );

  useEffect(
    function () {
      function callback(e) {
        if (e.key === "Escape") {
          setSelectedMovie(null);
        }
      }
      document.addEventListener("keydown", callback);
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [setSelectedMovie]
  );

  useEffect(
    function () {
      async function fetchMovieDetails() {
        setisLoading(true);
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${KEY}&i=${MovieId}`
        );
        const data = await res.json();
        setisLoading(false);
        setMovieData(data);
      }
      fetchMovieDetails();
    },
    [MovieId]
  );

  function handleMovieAdd() {
    const newWatchedMovie = {
      imdbID: MovieId,
      Title: movieData.Title,
      Year: movieData.Year,
      Poster: movieData.Poster,
      runtime: movieData.Runtime,
      imdbRating: movieData.imdbRating,
      userRating: rating,
    };
    handleTempMovieAdd(newWatchedMovie);
  }
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="movieDetailContainer">
          <header className="movieDetails">
            <img src={movieData.Poster} alt={movieData.Title}></img>
            <button class="btn-back" onClick={() => setSelectedMovie(null)}>
              ←
            </button>
            <div>
              <h2>{movieData.Title}</h2>
              <p>
                {movieData.Released} . {movieData.Runtime}
              </p>
              <p>{movieData.Genre}</p>
              <p>
                <span>⭐</span> {movieData.imdbRating} IMDB rating
              </p>
            </div>
          </header>
          <section>
            <div>
              {UserRating ? (
                <p>You rated with movie {UserRating}⭐</p>
              ) : (
                <>
                  <StarRating
                    maxRating={10}
                    size={25}
                    onSetRating={setRating}
                  />
                  {Boolean(rating) && (
                    <button onClick={handleMovieAdd}>Add to list</button>
                  )}
                </>
              )}
            </div>

            <p>{movieData.Plot}</p>
            <p>Starring {movieData.Actors}</p>
            <p>Directed by {movieData.Director}</p>
          </section>
        </div>
      )}
    </>
  );
}

export default function App() {
  const [watched, setWatched] = useState(function () {
    const watchedState = localStorage.getItem("watched");
    return JSON.parse(watchedState);
  });

  const [query, setQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movies, isLoading, isError] = useMovies(query);

  function handleTempMovieAdd(newWatchedMovie) {
    setWatched((watched) => [...watched, newWatchedMovie]);
    setSelectedMovie(null);
  }
  function handleRemoveWatchedMovie(imdbID) {
    setWatched((watched) =>
      watched.filter((currWatched) => currWatched.imdbID !== imdbID)
    );
  }

  //synchronize our effext with our local stprage
  useEffect(
    function () {
      localStorage.setItem("watched", JSON.stringify(watched));
    },
    [watched]
  );

  return (
    <>
      <Navbar>
        <Logo />
        <SearchMovie query={query} setQuery={setQuery} />
        <ShowResult movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {isLoading ? (
            <Loading />
          ) : isError ? (
            <ErrorMessage>{isError}</ErrorMessage>
          ) : (
            <MovieList movies={movies} setSelectedMovie={setSelectedMovie} />
          )}
        </Box>
        <Box>
          {selectedMovie ? (
            <MovieDetails
              MovieId={selectedMovie}
              setSelectedMovie={setSelectedMovie}
              handleTempMovieAdd={handleTempMovieAdd}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                handleRemoveWatchedMovie={handleRemoveWatchedMovie}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function SearchMovie({ query, setQuery }) {
  const inputEl = useRef(null);
  useEffect(
    function () {
      function callback(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.key === "Enter") {
          setQuery("");
          inputEl.current.focus();
        }
      }
      document.addEventListener("keydown", callback);
      inputEl.current.focus();
      return function () {
        document.removeEventListener("keydown", callback);
      };
    },
    [setQuery]
  );
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function ShowResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Loading() {
  return (
    <p style={{ textAlign: "center", fontSize: "3rem", marginTop: "3rem" }}>
      Loading...
    </p>
  );
}
function ErrorMessage({ children }) {
  return (
    <p style={{ textAlign: "center", fontSize: "3rem", marginTop: "3rem" }}>
      {children}
    </p>
  );
}

/*
function WatchedBox() {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen2((open) => !open)}
      >
        {isOpen2 ? "–" : "+"}
      </button>
      {isOpen2 && (
        <>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </>
      )}
    </div>
  );
}*/
