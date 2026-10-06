import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NavigationControls } from './NavigationControls'
import type { ViewerHandle } from '../viewer'

/** A viewer handle whose navigation methods are spies, so we can assert on the calls. */
function fakeViewer(): ViewerHandle & {
  resetView: ReturnType<typeof vi.fn>
  zoomBy: ReturnType<typeof vi.fn>
  panBy: ReturnType<typeof vi.fn>
  orbitBy: ReturnType<typeof vi.fn>
} {
  return {
    resetView: vi.fn(),
    focusOn: vi.fn(),
    zoomBy: vi.fn(),
    panBy: vi.fn(),
    orbitBy: vi.fn(),
  } as unknown as ViewerHandle & {
    resetView: ReturnType<typeof vi.fn>
    zoomBy: ReturnType<typeof vi.fn>
    panBy: ReturnType<typeof vi.fn>
    orbitBy: ReturnType<typeof vi.fn>
  }
}

describe('NavigationControls', () => {
  it('zooms in and out through the viewer handle', async () => {
    const viewer = fakeViewer()
    render(<NavigationControls viewerRef={{ current: viewer }} />)

    await userEvent.click(screen.getByRole('button', { name: /zoom in/i }))
    expect(viewer.zoomBy).toHaveBeenCalledWith(1)

    await userEvent.click(screen.getByRole('button', { name: /zoom out/i }))
    expect(viewer.zoomBy).toHaveBeenCalledWith(-1)
  })

  it('pans left and right by a fixed fraction', async () => {
    const viewer = fakeViewer()
    render(<NavigationControls viewerRef={{ current: viewer }} />)

    await userEvent.click(screen.getByRole('button', { name: /pan left/i }))
    await userEvent.click(screen.getByRole('button', { name: /pan right/i }))

    expect(viewer.panBy).toHaveBeenCalledTimes(2)
    const [firstLeft] = viewer.panBy.mock.calls[0]
    const [firstRight] = viewer.panBy.mock.calls[1]
    expect(firstLeft).toBeLessThan(0)
    expect(firstRight).toBeGreaterThan(0)
  })

  it('orbits and resets via the viewer handle', async () => {
    const viewer = fakeViewer()
    render(<NavigationControls viewerRef={{ current: viewer }} />)

    await userEvent.click(screen.getByRole('button', { name: /orbit up/i }))
    await userEvent.click(screen.getByRole('button', { name: /orbit down/i }))
    await userEvent.click(screen.getByRole('button', { name: /reset view/i }))

    expect(viewer.orbitBy).toHaveBeenCalledTimes(2)
    expect(viewer.resetView).toHaveBeenCalledTimes(1)
  })

  it('shows the "how to navigate" legend by default and can hide it', () => {
    const viewer = fakeViewer()
    const { rerender } = render(<NavigationControls viewerRef={{ current: viewer }} />)
    expect(screen.getByLabelText(/how to navigate/i)).toBeInTheDocument()
    expect(screen.getByText(/drag to orbit/i)).toBeInTheDocument()
    expect(screen.getByText(/scroll to zoom/i)).toBeInTheDocument()

    rerender(<NavigationControls viewerRef={{ current: viewer }} showLegend={false} />)
    expect(screen.queryByLabelText(/how to navigate/i)).not.toBeInTheDocument()
  })

  it('does nothing when the viewer is not mounted yet', async () => {
    render(<NavigationControls viewerRef={{ current: null }} />)
    // Should not throw when a control is clicked with no viewer wired up.
    await userEvent.click(screen.getByRole('button', { name: /zoom in/i }))
  })
})
