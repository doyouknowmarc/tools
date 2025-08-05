import React from 'react'
import clsx from 'clsx'

export default function Card({ className, ...props }) {
  return (
    <div
      className={clsx(
        'bg-white border border-gray-200 rounded-xl p-6 shadow-card',
        className
      )}
      {...props}
    />
  )
}
