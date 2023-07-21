import {
  fetchFragment,
  decorateFragment,
  createTag,
} from '../../scripts/scripts.js';

const COMPARISON_TITLE_SEPARATOR = 'vs.';

/**
 * Loads fragments to use in comparison
 * @param {*} fragments Fragments to load ('a' elements)
 * @returns {Promise} Promise containing array of fragments
 */
async function loadFragments(fragments) {
  const loadingFragments = [];
  fragments.forEach((fragment) => {
    const promisedFragment = fetchFragment(fragment.href)
      .then((responseFragment) => decorateFragment(responseFragment));
    loadingFragments.push(promisedFragment);
  });
  return Promise.allSettled(loadingFragments);
}
/**
 * Prepare stats fragments to be added as elements to nodes
 * @param {*} loadedFragments Promise containing array of fragments
 * @returns An array of oaded fragment elements
 */
function prepareLoadedFragments(loadedFragments) {
  const comparisonFragments = [];
  loadedFragments.forEach((loadedFragment) => {
    comparisonFragments.push(loadedFragment.value.querySelector(':scope .section'));
  });
  return comparisonFragments;
}

/**
 * Get details of a comparison item from a comparison cell
 * @param {*} comparedCell Node containing element details
 * @returns {Object} Object containing title, image and text of the comparison item
 */
function getComparisonItem(comparedCell) {
  let text;
  const textContent = comparedCell.querySelectorAll('p:not(.picture');
  if (textContent && textContent.length > 0) {
    text = textContent[0].textContent;
  }
  return {
    title: comparedCell.querySelector('h4'),
    image: comparedCell.querySelector('img'),
    text,
  };
}

export default async function decorate(block) {
  const blockChildren = [...block.children];
  if (blockChildren.length !== 2) return;

  // first row contains the title for first comparison element
  const textComparisonTitle = blockChildren[0].textContent.trim();
  // rest of comparison parts are in the second row
  const comparisonParts = [...blockChildren[1].children];
  if (comparisonParts.length !== 3) return;
  // elements to put in the middle that compare left and right
  const statsToUseForCompare = comparisonParts[1].querySelectorAll('a');
  const loadingFragmentsTask = loadFragments(statsToUseForCompare);
  const comparisonTitles = [...comparisonParts[1].querySelectorAll('p:not(.button-container')];
  // get the compared elements components
  const leftComparisonItem = getComparisonItem(comparisonParts[0]);
  const rightComparisonItem = getComparisonItem(comparisonParts[2]);

  block.innerHTML = '';
  const comparisonImageLeft = createTag('div', { class: 'vs-comparison-image-left' });
  const comparisonImageRight = createTag('div', { class: 'vs-comparison-image-right' });
  comparisonImageLeft.append(leftComparisonItem.image);
  comparisonImageRight.append(rightComparisonItem.image);

  const titleHolder = createTag('div', { class: 'vs-title-line' });
  const titleMiddle = createTag('span', { class: 'vs-middle-tile' });
  titleMiddle.textContent = COMPARISON_TITLE_SEPARATOR;
  titleHolder.append(leftComparisonItem.title, titleMiddle, rightComparisonItem.title);

  const comparisonHolder = createTag('div', { class: 'vs-comparison-holder' });
  const comparisonLine = createTag('div', { class: 'vs-comparison-line' });

  const comparisonSummary = createTag('div', { class: 'vs-comparison-summary' });
  const summaryTitle = createTag('p', { class: 'vs-comparison-summary-title' });
  const summaryLeftProduct = createTag('p', { class: 'vs-comparison-left-product' });
  const summaryRightProduct = createTag('p', { class: 'vs-comparison-right-product' });
  summaryTitle.textContent = textComparisonTitle;
  summaryLeftProduct.textContent = leftComparisonItem.text;
  summaryRightProduct.textContent = rightComparisonItem.text;
  comparisonSummary.append(summaryTitle, summaryLeftProduct, summaryRightProduct);

  const loadedFragments = await loadingFragmentsTask;
  const loadedFragmentsContent = prepareLoadedFragments(loadedFragments);
  comparisonLine.append(comparisonSummary);
  const statsToAdd = [];
  [...loadedFragmentsContent].forEach((statElement, i) => {
    const statNode = createTag('div', { class: 'vs-comparison-stat-element' });
    statNode.append(comparisonTitles[i], statElement);
    statsToAdd.push(statNode);
  });
  comparisonLine.append(...statsToAdd);

  comparisonHolder.append(titleHolder, comparisonLine);
  block.append(comparisonImageLeft, comparisonHolder, comparisonImageRight);
}
