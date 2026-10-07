import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoomTooltip } from './RoomTooltip'

describe('RoomTooltip', () => {
  it('renders nothing when there is no hovered room', () => {
    render(<RoomTooltip label={null} x={10} y={20} />)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows the room name when a room is hovered', () => {
    render(<RoomTooltip label="Bedroom" x={10} y={20} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Bedroom')
  })

  it('anchors itself near the pointer hotspot', () => {
    render(<RoomTooltip label="Bedroom" x={100} y={200} />)
    const tooltip = screen.getByRole('tooltip')
    expect(parseFloat(tooltip.style.left)).toBeGreaterThan(100)
    expect(parseFloat(tooltip.style.top)).toBeGreaterThan(200)
  })

  it('swaps the label as the hovered room changes', () => {
    const { rerender } = render(<RoomTooltip label="Kitchen" x={0} y={0} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Kitchen')

    rerender(<RoomTooltip label="Second Bedroom" x={0} y={0} />)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Second Bedroom')
  })
})
