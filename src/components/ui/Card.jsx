import React from 'react'
import clsx from 'clsx'

export default function Card({ className, ...props }) {
  return (
    <div
      className={clsx('card', className)}
      {...props}
    />
  )
}
