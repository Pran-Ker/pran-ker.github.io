import * as controller from './modules/controller.js';
import * as navigate from './modules/navigate.js';
import * as scroll from './modules/scroll.js';
import * as signup from './modules/signup.js';
import * as toggle from './modules/toggle.js';

document.addEventListener('DOMContentLoaded', () => {
  controller.ready();
  navigate.ready();
  signup.ready();
});

addEventListener('load', () => {
  controller.load();
  scroll.load();
});

addEventListener('resize', () => {
  controller.resize();
});

function toggleVisibility(id) {
  var element = document.getElementById(id);
  if (element.style.display === "none") {
    element.style.display = "block";
  } else {
    element.style.display = "none";
  }
};