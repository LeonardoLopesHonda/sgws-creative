import { decorateIcons } from '../../scripts/lib-franklin.js';
import { createTag } from '../../scripts/scripts.js';

export default function decorate(showcaseBlock) {
  const imageColumn = showcaseBlock.removeChild(showcaseBlock.children[0]);
  const evenNumberOfHotspots = showcaseBlock.children.length % 2 === 0;
  const columns = createTag('div', { class: evenNumberOfHotspots ? 'even-hotspots' : 'odd-hotspots' });

  // Setup 5 rows and 3 columns.  Hotspot buttons are in the left and right columns and the
  // 'bottle' image in the middle.
  // Even number of hotspots - 1 button in left column, 1 button in right column
  // Odd number of hotspots - buttons in alternate rows (left/right cell)
  [...showcaseBlock.children].forEach((row, index) => {
    if (index === 1) {
      // Add the 'bottle' image.
      imageColumn.classList.add('showcase-image-cell');
      columns.append(imageColumn);
    } else if (index % 2 === 1) {
      // Empty cell in middle column
      columns.append(createTag('div', { class: 'showcase-image-cell' }));
    }

    // Created the 'hotspot' div.
    const side = index % 2 === 0 ? 'left' : 'right';
    const hotSpot = createTag('div', { class: `showcase-hotspot-${side}` });
    hotSpot.innerHTML = `<button type="button" aria-label="Showcase hover">
        <span class="icon icon-plus"></span>
      </button>`;

    const popupDialog = document.createElement('div');

    const headerText = row.querySelector('div');
    const popupHeader = document.createElement('h2');
    popupHeader.innerText = headerText.innerText;
    popupDialog.append(popupHeader);
    row.removeChild(headerText);

    const bodyText = row.querySelector('div');
    const popupText = document.createElement('span');
    popupText.innerText = bodyText.innerText;
    popupDialog.append(popupText);

    const button = hotSpot.querySelector('button');
    if (evenNumberOfHotspots) {
      button.prepend(popupDialog);
    } else {
      button.append(popupDialog);
    }

    row.removeChild(bodyText);
    row.prepend(hotSpot);
    showcaseBlock.removeChild(row);

    if (!evenNumberOfHotspots && index % 2 === 1) {
      // Empty cell in last column, next row's 1st column and next row's 2nd column
      columns.append(document.createElement('div'));
      columns.append(document.createElement('div'));
      columns.append(createTag('div', { class: 'showcase-image-cell' }));
    }
    columns.append(hotSpot);
  });

  // Just for completeness, finish the bottom row in the 'odd' case.
  if (!evenNumberOfHotspots) {
    columns.append(document.createElement('div'));
    columns.append(document.createElement('div'));
  }

  showcaseBlock.append(columns);
  decorateIcons(columns);

  const repeatAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const { target, isIntersecting } = entry;
      if (isIntersecting) {
        if (!target.classList.contains('animate')) {
          target.classList.add('animate');
          target.addEventListener('animationend', () => {
            target.classList.remove('animate');
          }, { passive: true, once: true });
        }
      }
    }, { threshold: 0.1 });
  });
  showcaseBlock.querySelectorAll('.icon-plus').forEach((element) => {
    repeatAnimationObserver.observe(element);
  });
}
