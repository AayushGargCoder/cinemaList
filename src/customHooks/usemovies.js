import { useEffect, useState } from "react";
const KEY = "6f4d1dd6";

export default function useMovies(query) {
  const [isLoading, setisLoading] = useState(false);
  const [isError, setisError] = useState("");
  const [movies, setMovies] = useState([]);
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchMovie() {
        try {
          setisLoading(true);
          setisError("");
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
            { signal: controller.signal }
          );
          if (!res.ok)
            throw new Error("Something went wrong with fetching movies");

          const data = await res.json();
          if (data.Response === "False") throw new Error("Movie Not Found");
          setMovies(data.Search);
        } catch (err) {
          console.log(err);
          if (err.name !== "AbortError") setisError(err.message);
        } finally {
          setisLoading(false);
        }
      }
      if (query.length >= 3) fetchMovie();
      else {
        setMovies([]);
      }

      return function () {
        controller.abort();
      };
    },
    [query]
  );
  return [movies, isLoading, isError];
}
