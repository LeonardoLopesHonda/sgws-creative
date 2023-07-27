// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';

window.hasCharts = window.hasCharts || false;

// Core Web Vitals RUM collection
sampleRUM('cwv');

// loads additional delayed scripts
const loadScript = (url, attrs) => {
  const head = document.querySelector('head');
  const loadedScripts = head.querySelectorAll('script');
  const loadedScriptsElements = [...loadedScripts];
  for (let i = 0; i < loadedScriptsElements.length; i += 1) {
    const currentScript = loadedScriptsElements[i];
    if (currentScript.src === url) return null;
  }

  const script = document.createElement('script');

  script.src = url;
  if (attrs) {
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const attr in attrs) {
      script.setAttribute(attr, attrs[attr]);
    }
  }
  head.append(script);

  return script;
};

// add more delayed functionality here
// Maps (and projections)
const echartsLink = 'https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js';
if (document.querySelector('div.chart-map-container')) {
  const d3MapUtils = loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3-geo/1.9.1/d3-geo.min.js', {
    type: 'text/javascript',
  });
  if (d3MapUtils !== null) {
    d3MapUtils.onload = () => {
      const echarts = loadScript(echartsLink, {
        type: 'text/javascript',
      });
      if (echarts !== null) {
        echarts.onload = () => {
          document.dispatchEvent(new Event('echartsloaded'));
        };
      }
    };
  }
}

// Charts
if (window.hasCharts) {
  const echarts = loadScript(echartsLink, {
    type: 'text/javascript',
  });
  echarts.onload = () => {
    document.dispatchEvent(new Event('echartsloaded'));
  };
}
