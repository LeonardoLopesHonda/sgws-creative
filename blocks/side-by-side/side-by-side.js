import {
  fetchFragment,
  decorateFragment,
} from '../../scripts/scripts.js';

async function loadFragments(comparedItem) {
  const allFragments = [...comparedItem.querySelectorAll('a')];

  const loadingFragments = [];
  allFragments.forEach((fragment) => {
    const promisedFragment = fetchFragment(fragment.href)
      .then((responseFragment) => decorateFragment(responseFragment));
    loadingFragments.push(promisedFragment);
  });
  const loadedFragments = await Promise.allSettled(loadingFragments);

  const comparisonFragments = [];
  loadedFragments.forEach((loadedFragment) => {
    const chartContent = loadedFragment.value.querySelector(':scope .section');
    comparisonFragments.push(chartContent);
  });

  return comparisonFragments;
}

export default async function decorate(block) {
  const blockChildren = [...block.children];
  if (blockChildren.length !== 1) return;
  const comparisonElements = [...blockChildren[0].children];
  if (comparisonElements.length !== 2) return;

  const leftTitle = comparisonElements[0].querySelector('h4');
  const rightTitle = comparisonElements[1].querySelector('h4');
  leftTitle.classList.add('side-by-side-left-title');
  rightTitle.classList.add('side-by-side-right-title', 'element-left-border');
  const leftElements = await loadFragments(comparisonElements[0]);
  const rightElements = await loadFragments(comparisonElements[1]);
  if (rightElements.length > 0) {
    rightElements[0].classList.add('element-left-border', 'compared-element-padding');
  }
  const totalComparedItems = leftElements.length + rightElements.length;

  block.innerHTML = '';
  leftTitle.style.gridColumnStart = '1';
  leftTitle.style.gridColumnEnd = `${leftElements.length + 1}`;
  rightTitle.style.gridColumnStart = `${leftElements.length + 1}`;
  rightTitle.style.gridColumnEnd = `${totalComparedItems + 1}`;
  block.style.gridTemplateColumns = `repeat(${totalComparedItems}, minmax(220px, 1fr))`;
  block.append(leftTitle, rightTitle, ...leftElements, ...rightElements);
}
