import * as navigate from './modules/navigate.js';
import * as scroll from './modules/scroll.js';
import * as toggle from './modules/toggle.js';

document.addEventListener('DOMContentLoaded', () => {
  navigate.ready();
  toggle.ready();
});

addEventListener('load', () => {
  scroll.load();
});