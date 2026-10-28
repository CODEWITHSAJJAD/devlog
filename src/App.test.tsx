import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders DevLog application without crashing', async () => {
  render(<App />);
  const elements = await screen.findAllByText(/DevLog/i);
  expect(elements.length).toBeGreaterThan(0);
});
