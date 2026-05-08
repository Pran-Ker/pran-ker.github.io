import * as navigate from './modules/navigate.js';
import * as scroll from './modules/scroll.js';
import * as toggle from './modules/toggle.js';
import * as thoughtArt from './modules/thought-art.js';

document.addEventListener('DOMContentLoaded', () => {
  navigate.ready();
  toggle.ready();
  thoughtArt.ready();
});

addEventListener('load', () => {
  scroll.load();
});