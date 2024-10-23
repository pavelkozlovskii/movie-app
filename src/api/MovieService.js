import axios from 'axios'

class MovieService {
  constructor() {
    this._apiUrl = 'https://api.themoviedb.org/3'
    this._posterUrl = 'https://image.tmdb.org/t/p/w500'
    this._apiToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyODBiODcyMzVhNTJhZTg4NjI4MGMzYWE0NGQwNzdlZCIsIm5iZiI6MTcyOTQ5OTAyNC42NzM2NjksInN1YiI6IjY2ZjZhODViZTBiZjdhYzI4NTk2N2ExNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.JaM3noiuO5tk2p-yRi8o0LeRD4wcw8nbmFjqOv4B0D4'
    this._headers = {
      accept: 'application/json',
      'Content-Type': 'application/json;charset=utf-8',
      Authorization: `Bearer ${this._apiToken}`,
    }
    this._api = axios.create({
      baseURL: this._apiUrl,
      headers: this._headers,
    })
  }

  async fetchData(url, options) {
    const response = await this._api.get(url, options)
    return response.data
  }

  async postData(url, data, options) {
    const response = await this._api.post(url, data, options)
    return response.data
  }

  async deleteData(url, options) {
    const response = await this._api.delete(url, options)
    return response.data
  }

  async searchMovies(query, page = 1) {
    if (!query) return

    try {
      const data = await this.fetchData('/search/movie', {
        params: {
          query,
          page,
        },
      })
      return this.convertMoviesData(data)
    } catch (e) {
      throw new Error(`[${e.response?.status || 'o_0'}] Failed to fetch movies. Try again later.`)
    }
  }

  async getMovieGenres() {
    try {
      const data = await this.fetchData('/genre/movie/list')
      return data.genres
    } catch (e) {
      throw new Error(`[${e.response?.status || 'o_0'}] Failed to fetch genres. Try again later.`)
    }
  }

  convertMoviesData({ results, ...data }) {
    return {
      results: results.map((movie) => {
        const posterUrl = movie.poster_path && this._posterUrl + movie.poster_path

        return {
          id: movie.id,
          title: movie.title,
          releaseDate: movie.release_date,
          genres: movie.genre_ids,
          description: movie.overview,
          posterImageUrl: posterUrl,
          rating: movie.vote_average,
          rate: movie.rating,
        }
      }),
      page: data.page,
      totalResults: data.total_results,
    }
  }

  async createGuestSession() {
    try {
      const data = await this.fetchData('/authentication/guest_session/new')
      return {
        sessionId: data.guest_session_id,
        expiresAt: data.expires_at,
      }
    } catch (e) {
      throw new Error(`[${e.response?.status || 'o_0'}] Failed to create guest session. Try again later.`)
    }
  }

  async getRatedMovies(sessionId, page = 1) {
    try {
      const data = await this.fetchData(`/guest_session/${sessionId}/rated/movies`, {
        params: {
          page,
        },
      })
      return this.convertMoviesData(data)
    } catch (e) {
      throw new Error(
        `[${e.response?.status || 'o_0'}] Failed to fetch rated movies. Try again later.\nHow about rating some movies first?`
      )
    }
  }

  async rateMovie(movieId, value, sessionId) {
    try {
      const result = await this.postData(
        `/movie/${movieId}/rating`,
        {
          value,
        },
        {
          params: {
            guest_session_id: sessionId,
          },
        }
      )
      return result
    } catch (e) {
      throw new Error(`[${e.response?.status || 'o_0'}] Failed to rate movie. Try again later.`)
    }
  }

  async unrateMovie(movieId, sessionId) {
    try {
      const result = await this.deleteData(`/movie/${movieId}/rating`, {
        params: {
          guest_session_id: sessionId,
        },
      })
      return result
    } catch (e) {
      throw new Error(`[${e.response?.status || 'o_0'}] Failed to unrate movie. Try again later.`)
    }
  }
}

export default MovieService
