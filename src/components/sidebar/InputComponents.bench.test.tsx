// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { NumberInput } from './InputComponents';

describe('NumberInput Performance Benchmark', () => {
  it('debounces onChange calls during rapid typing', () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    render(<NumberInput label="Test Input" value={0} onChange={handleChange} />);

    const input = screen.getByLabelText('Test Input');

    // Simulate rapid typing: "1", "12", "123"
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.change(input, { target: { value: '12' } });
    fireEvent.change(input, { target: { value: '123' } });

    // Should NOT be called immediately due to debounce
    expect(handleChange).not.toHaveBeenCalled();

    // Fast-forward time by 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be called ONLY ONCE with the final value
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(123);

    vi.useRealTimers();
  });

  it('triggers onChange immediately on blur', () => {
    vi.useFakeTimers();
    const handleChange = vi.fn();
    // Use a different label to avoid collision with previous test if cleanup is slow
    render(<NumberInput label="Test Input Blur" value={0} onChange={handleChange} />);

    const input = screen.getByLabelText('Test Input Blur');

    fireEvent.change(input, { target: { value: '50' } });

    // Blur immediately.
    // We manually set the target value in the blur event because relying on React's state update -> DOM update cycle
    // within the fake timer environment can be flaky, and we want to test the handleBlur logic itself.
    fireEvent.blur(input, { target: { value: '50' } });

    // Should be called immediately without waiting for timer
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(50);

    // Timer should be cleared, so advancing time shouldn't trigger another call
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(handleChange).toHaveBeenCalledTimes(1); // Still 1

    vi.useRealTimers();
  });
});
