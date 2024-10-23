import { useContext, useEffect, useState } from 'react'
import { Card, Progress, Rate, Tag, Typography } from 'antd'
import defaultPoster from '../../assets/defaultPoster.jpg'
import './Card.css'
import { formatDate, sliceText } from '../../services/utils'
import MovieServiceContext from '../../context/MovieServiceContext'
import RatedMoviesContext from '../../context/RatedMoviesContext'

const { Title, Text, Paragraph } = Typography

export default function MovieCard({ card }) {
  const { api, genres: genresList, sessionId } = useContext(MovieServiceContext)
  const { ratedCards, setRatedCards } = useContext(RatedMoviesContext)

  const genres = card.genres && genresList.filter((genre) => card.genres.includes(genre.id))
  const cardRatingAvg = card.rating.toFixed(1)
  const cardRate = ratedCards.find((item) => item.id === card.id)?.rate

  const [rate, setRate] = useState(card.rate || cardRate || 0)

  let ratingColor
  if (card.rating >= 7) {
    ratingColor = '#66E900'
  } else if (card.rating >= 5) {
    ratingColor = '#E9D100'
  } else if (card.rating >= 3) {
    ratingColor = '#E97E00'
  } else {
    ratingColor = '#E90000'
  }

  const formattedDate = formatDate(card.releaseDate)

  function isInRatedCards(id) {
    return ratedCards.findIndex((item) => item.id === id) !== -1
  }

  function updateRatedCards(id, rateValue) {
    if (rateValue) {
      if (isInRatedCards(id)) {
        setRatedCards(ratedCards.map((item) => (item.id === id ? { ...item, rate: rateValue } : item)))
      } else {
        setRatedCards([...ratedCards, { id, rate: rateValue }])
      }
    } else {
      setRatedCards(ratedCards.filter((item) => item.id !== id))
    }
  }

  async function handleChangeRate(value) {
    if (value) {
      await api.rateMovie(card.id, value, sessionId)
    } else {
      await api.unrateMovie(card.id, sessionId)
    }

    setRate(value)
    updateRatedCards(card.id, value)
  }

  useEffect(() => {
    setRate(cardRate)
  }, [cardRate])

  return (
    <Card
      hoverable
      className="card"
      classNames={{
        body: 'card__body',
      }}
    >
      <img
        alt="poster"
        src={card.posterImageUrl || defaultPoster}
        onError={(e) => {
          e.currentTarget.src = defaultPoster
        }}
        className="card__image"
      />
      <div className="card__header">
        <div className="card__header-top">
          <Title level={2} className="card__title">
            {card.title}
          </Title>
          <Progress
            type="circle"
            percent={card.rating * 10}
            format={() => cardRatingAvg}
            size={40}
            className="card__rating"
            strokeColor={ratingColor}
          />
        </div>
        <Text type="secondary">{formattedDate}</Text>
        <div className="card__tags">{genres && genres.map((genre) => <Tag key={genre.id}>{genre.name}</Tag>)}</div>
      </div>
      <div className="card__info">
        <Paragraph className="card__description">{sliceText(card.description)}</Paragraph>
        <Rate allowHalf count={10} value={rate} className="card__rate" onChange={(value) => handleChangeRate(value)} />
      </div>
    </Card>
  )
}
