'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button'

type LinkButtonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>

export function LinkButton({ href, children, variant, size, className, ...props }: LinkButtonProps) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </Link>
  )
}
