import React from 'react'
import clsx from 'clsx'

export default function Button({ className, ...props }) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
}
