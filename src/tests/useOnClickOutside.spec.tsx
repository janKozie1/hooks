import '@testing-library/jest-dom/extend-expect'
import React from 'react'
import { screen, render, act, waitForElementToBeRemoved } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useOnClickOutside from '../useOnClickOutside'

type Callback = () => void

const SimpleTestComponent = ({ callback }: { callback: Callback }) => {
  const ref = React.useRef<HTMLDivElement>(null)
  useOnClickOutside(ref, callback)

  return (
    <div>
      parent
      <div>
        sibling
        <div>sibling child</div>
      </div>
      <div ref={ref}>
        target
        <div>
          target child<div>nested target child</div>
        </div>
      </div>
    </div>
  )
}

const ComplexTestComponent = ({
  parentCallback,
  childCallback,
}: {
  parentCallback: Callback
  childCallback: Callback
}) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  const close = React.useCallback(() => setIsOpen(false), [setIsOpen])
  const toggle = React.useCallback(() => setIsOpen((state) => !state), [setIsOpen])

  useOnClickOutside(ref, () => {
    parentCallback()
    close()
  })

  return (
    <div>
      grandparent
      <div ref={ref}>
        parent sibling <button onClick={toggle}>toggle button</button>
      </div>
      {isOpen && <SimpleTestComponent callback={childCallback} />}
    </div>
  )
}

describe('useOnClickOutside', () => {
  describe('in unnested component', () => {
    let callback: jest.Mock

    beforeEach(() => {
      callback = jest.fn()
      render(<SimpleTestComponent callback={callback} />)
    })

    describe('calls callback', () => {
      it('when clicking on targets sibling', () => {
        userEvent.click(screen.getByText('sibling'))
        expect(callback).toHaveBeenCalled()
      })

      it("when clicking on target's parent", () => {
        userEvent.click(screen.getByText('parent'))
        expect(callback).toHaveBeenCalled()
      })
    })

    describe("doesn't call callback", () => {
      it('when clicking the target', () => {
        userEvent.click(screen.getByText('target'))
        expect(callback).not.toHaveBeenCalled()
      })

      it('when clicking on a direct child of the target', () => {
        userEvent.click(screen.getByText('target child'))
        expect(callback).not.toHaveBeenCalled()
      })

      it('when clicking on a nested child of the target', () => {
        userEvent.click(screen.getByText('nested target child'))
        expect(callback).not.toHaveBeenCalled()
      })
    })
  })

  describe('in nested component', () => {
    let parentCallback: jest.Mock
    let childCallback: jest.Mock

    beforeEach(() => {
      parentCallback = jest.fn()
      childCallback = jest.fn()

      render(<ComplexTestComponent {...{ parentCallback, childCallback }} />)
    })

    it('triggers callback when clicked outside of all elements', async () => {
      expect(screen.queryByText('parent')).toBe(null)

      userEvent.click(screen.getByRole('button'))

      expect(await screen.findByText('parent')).not.toBe(null)

      // click outside of all elements that had onClickOutside
      act(() => {
        userEvent.click(screen.getByText('grandparent'))
      })

      expect(parentCallback).toHaveBeenCalled()
      expect(childCallback).toHaveBeenCalled()
    })

    it('clears listeners when unmounted', async () => {
      expect(screen.queryByText('parent')).toBe(null)

      userEvent.click(screen.getByRole('button'))

      await screen.findByText('parent')

      act(() => {
        userEvent.click(screen.getByText('grandparent'))
      })

      act(() => {
        userEvent.click(screen.getByText('grandparent'))
      })

      expect(childCallback).toHaveBeenCalledTimes(1)
    })
  })
})
