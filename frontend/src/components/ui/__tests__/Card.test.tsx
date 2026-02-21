import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from '../Card'

describe('Card', () => {
  it('renders children content', () => {
    render(<Card>Hello World</Card>)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('applies the glass-card base class', () => {
    const { container } = render(<Card>Test</Card>)
    const div = container.firstElementChild as HTMLElement
    expect(div.className).toContain('glass-card')
  })

  it('merges custom className', () => {
    const { container } = render(<Card className="my-custom">Test</Card>)
    const div = container.firstElementChild as HTMLElement
    expect(div.className).toContain('my-custom')
    expect(div.className).toContain('glass-card')
  })
})
