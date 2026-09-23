import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SearchBar } from '@/features/search/SearchBar'

describe('SearchBar', () => {
  it('submits a trimmed query with Enter', async () => {
    const onSubmit = vi.fn()
    render(<SearchBar value="" onSubmit={onSubmit} />)

    await userEvent.type(screen.getByRole('textbox', { name: 'Search articles' }), '  climate policy  {Enter}')

    expect(onSubmit).toHaveBeenCalledWith('climate policy')
  })

  it('clears both the draft and the active query', async () => {
    const onSubmit = vi.fn()
    render(<SearchBar value="science" onSubmit={onSubmit} />)

    await userEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(screen.getByRole('textbox')).toHaveValue('')
    expect(onSubmit).toHaveBeenCalledWith('')
  })
})
