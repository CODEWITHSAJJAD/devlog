import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  jest.spyOn(global, 'fetch').mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: false }),
    } as Response)
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders DevLog application without crashing', async () => {
  render(<App />);
  const elements = await screen.findAllByText(/DevLog/i);
  expect(elements.length).toBeGreaterThan(0);
});
