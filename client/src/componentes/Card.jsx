import React from 'react'

export const Card = ({ image, name, diets }) => {
  return (
    <div className=''>
      <h2>{name}</h2>
      <img src={image} alt="img not fond" width="200px" height="250px"/>
      <h5>{diets}</h5>
    </div>
  )
}