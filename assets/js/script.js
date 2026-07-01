import * as toggle from './modules/toggle.js';
import * as thoughtArt from './modules/thought-art.js';
import * as showcase from './modules/showcase.js';
import * as prefetch from './modules/prefetch.js';

document.addEventListener('DOMContentLoaded', () => {
  toggle.ready();
  thoughtArt.ready();
  showcase.ready();
  prefetch.ready();
});