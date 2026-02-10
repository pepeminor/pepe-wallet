import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from '@/providers/AppProviders';
import { AppRoutes } from '@/router/routes';

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <div className="app-container">
          <AppRoutes />
        </div>
      </AppProviders>
    </BrowserRouter>
  );
}
