import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Durga Handicrafts branding', () => {
  render(<App />);
  const linkElement = screen.getByText(/Durga Handicrafts/i);
  expect(linkElement).toBeInTheDocument();
});
