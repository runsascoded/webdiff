import {createRoot} from 'react-dom/client';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {HotkeysProvider} from 'use-kbd';
import 'use-kbd/styles.css';
import {injectStylesFromConfig} from './options';
import {Root} from './Root';

const App = () => (
  <HotkeysProvider config={{storageKey: 'webdiff-hotkeys'}}>
    <Router>
      <Routes>
        <Route path="/:index?" element={<Root />} />
      </Routes>
    </Router>
  </HotkeysProvider>
);

injectStylesFromConfig();
createRoot(document.getElementById('application')!).render(<App />);

const host = window.location.host;
const websocket = new WebSocket(`ws://${host}/ws`);
websocket.onmessage = msg => {
  // no op
};
websocket.onopen = e => {
  websocket.send('hello!');
};
