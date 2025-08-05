import React from 'react'
import clsx from 'clsx'

export default function Button({ className, ...props }) {
  return (
    <button
      className={clsx('btn', className)}
      {...props}
    />
  )
}
