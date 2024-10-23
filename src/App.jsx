import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCookies } from 'react-cookie'
import { Tabs } from 'antd'
import './App.css'
import MovieService from './api/MovieService'
import MovieServiceContext from './context/MovieServiceContext'
import RatedMoviesContext from './context/RatedMoviesContext'
import SearchTab from './components/SearchTab/SearchTab'
import RatedTab from './components/RatedTab/RatedTab'

function App() {
  const api = useMemo(() => new MovieService(), [])
  const [sessionId, setSessionId] = useState(null)
  const [genres, setGenres] = useState([])
  const [ratedCards, setRatedCards] = useState([])

  const [, setFetchError] = useState(null)
  const [cookies, setCookie] = useCookies(['sessionId'])

  const saveSessionId = useCallback(
    (id, expires) => {
      setCookie('sessionId', id, { expires })
    },
    [setCookie]
  )

  const getSavedSessionId = useCallback(() => {
    return cookies.sessionId
  }, [cookies.sessionId])

  useEffect(() => {
    async function fetchGenres() {
      try {
        const data = await api.getMovieGenres()
        setGenres(data)
      } catch (e) {
        setFetchError(e.message)
      }
    }

    async function getSessionId() {
      try {
        const savedId = getSavedSessionId()
        if (savedId) {
          setSessionId(savedId)
          return
        }
        const { sessionId: id, expiresAt } = await api.createGuestSession()
        setSessionId(id)
        saveSessionId(id, new Date(expiresAt))
      } catch (e) {
        setFetchError(e.message)
      }
    }

    fetchGenres()
    getSessionId()
  }, [api, getSavedSessionId, saveSessionId])

  useEffect(() => {
    if (!sessionId) {
      return
    }

    async function fetchRatedMovies() {
      try {
        const { results } = await api.getRatedMovies(sessionId)
        setRatedCards(results.map(({ id, rate }) => ({ id, rate })))
      } catch (e) {
        setFetchError(e.message)
      }
    }

    fetchRatedMovies()
  }, [api, sessionId])

  const tabs = [
    {
      key: 'search',
      label: 'Search',
      children: <SearchTab />,
    },
    {
      key: 'rated',
      label: 'Rated',
      children: <RatedTab />,
      destroyInactiveTabPane: true,
    },
  ]

  const mainContext = useMemo(() => ({ api, genres, sessionId }), [api, genres, sessionId])

  const ratedContext = useMemo(() => ({ ratedCards, setRatedCards }), [ratedCards, setRatedCards])

  return (
    <div className="container">
      <MovieServiceContext.Provider value={mainContext}>
        <RatedMoviesContext.Provider value={ratedContext}>
          <Tabs defaultActiveKey="1" items={tabs} className="tabs" centered tabBarStyle={{ marginInline: 'auto' }} />
        </RatedMoviesContext.Provider>
      </MovieServiceContext.Provider>
    </div>
  )
}

export default App
