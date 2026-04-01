import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
createRoot(document.getElementById('root')).render(
	<StrictMode>
		<BrowserRouter>
			<App />
			<Toaster richColors />
		</BrowserRouter>
	</StrictMode>,
);
