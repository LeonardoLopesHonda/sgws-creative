import {
  createVideoTag,
  createTag,
  animationObserver,
  createIcon,
} from '../../scripts/scripts.js';
import { createOptimizedPicture, decorateIcons } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  const iconCols = block.querySelectorAll(':scope > div > div > *:first-child:has(span.icon)');
  if (iconCols.length === cols.length) {
    block.classList.add('icon-list');
  }

  /* Enable variations in the inline video component.
   *  no-animate: Do not animate the image into view
   *  no-video-background: No offset background
   *  video-tall: Allow video to be larger (but at least) 50vw.
   */
  const animate = !block.classList.contains('no-animate');
  block.classList.remove('no-animate');
  const videoBackground = !block.classList.contains('no-video-background');
  block.classList.remove('no-video-background');

  // setup image columns and help button
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const videoLink = col.querySelector(':scope a');
      if (videoLink?.href?.endsWith('.mp4')) {
        const videoP = videoLink?.closest('p');
        const posterP = videoP.previousElementSibling;
        const posterImage = posterP?.querySelector('img');
        const attributes = {
          preload: 'none',
        };

        const video = createVideoTag(videoLink.href, posterImage?.src, attributes);
        const playButton = createTag('button', {
          class: 'play-button',
          type: 'button',
          'aria-label': 'Play Video',
        });

        playButton.addEventListener('click', () => {
          video.controls = true;
          video.play();
          playButton.remove();
        }, { passive: true });
        const videoGroup = createTag('p', { class: `video-group ${animate ? '' : 'no-animate'}` });
        videoGroup.append(video, playButton);

        let background;
        if (videoBackground) {
          background = createTag('div', { class: 'video-background' });
          col.append(videoGroup, background);
        } else {
          col.append(videoGroup);
        }

        videoP.remove();
        posterP.remove();
        block.classList.add('inline-video');

        animationObserver.observe(videoGroup);
        if (background) {
          animationObserver.observe(background);
        }
      }

      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }

      const helpIcon = col.querySelector(':scope span.icon-help');
      const tabView = document.querySelector('div.tabview');
      if (helpIcon && tabView) {
        const parent = helpIcon.closest('p');
        if (parent) {
          const helpDiv = createTag('div', { class: 'has-help' });
          const helpP = createTag('p', { class: 'animate' });

          helpIcon.addEventListener('click', () => {
            helpIcon.closest('div.columns-wrapper').classList.toggle('help-open');
            tabView.classList.toggle('help-open');
          }, { passive: true });
          helpP.append(helpIcon);

          helpDiv.append(parent, helpP);
          col.append(helpDiv);

          // Image to overlay
          const navDiv = createTag('div', { class: 'nav-help animate' });
          const img = createOptimizedPicture(
            'https://main--sgws-creative--hlxsites.hlx.page/bloominbrands/images/help-nav.jpg',
            'Navigation help',
            false,
          );
          navDiv.append(img);

          // Button to close overlay
          const closeIcon = createIcon('close');
          closeIcon.classList.add('nav-help-close', 'animate');
          closeIcon.addEventListener('click', () => {
            helpIcon.closest('div.columns-wrapper').classList.remove('help-open');
            tabView.classList.remove('help-open');
          }, { passive: true });
          block.parentNode.append(closeIcon);
          decorateIcons(block.parentNode);

          block.parentNode.append(navDiv);
        }
      }
    });
  });

  // stats background image
  if (block.classList.contains('stats')) {
    const backgroundPicture = block.querySelector(':scope > div > .columns-img-col');
    if (backgroundPicture) {
      const pictureParent = backgroundPicture.parentElement;
      const img = backgroundPicture.querySelector('img');
      pictureParent.remove();
      block.firstElementChild.style.backgroundImage = `url(${img.src})`;
      block.classList.add('background-image');
    }
  }
  if (block.classList.contains('product-stats')) {
    const paragraphs = block.querySelectorAll('p, em, h2, h3, h4');
    paragraphs.forEach((p) => { p.classList.add('no-animate'); });

    // Check for header -> first cell of first row is empty.
    const headerRow = block.querySelectorAll('div > div:first-child > div:first-child');
    if (headerRow && headerRow.length > 0) {
      const firstCell = headerRow[0].querySelectorAll('div:first-child');
      if (firstCell && firstCell[0].childElementCount === 0) {
        const headerTable = createTag('div', { class: 'product-stats-header' });
        headerTable.classList.add(...block.classList);
        headerTable.append(headerRow[0]);
        block.parentElement.prepend(headerTable);
        block.parentElement.classList.add('has-header');
      }
    }

    const productStatsText = block.parentElement.parentElement.querySelectorAll('.default-content-wrapper');
    const productStatsTextElements = [...productStatsText];
    if (productStatsTextElements.length === 1) {
      productStatsTextElements[0].classList.add('product-stats-footer');
    } else if (productStatsTextElements.length > 1) {
      const firstTextElement = productStatsTextElements[0];
      firstTextElement.classList.add('product-stats-header-title');
      const lastTextElement = productStatsTextElements[productStatsTextElements.length - 1];
      lastTextElement.classList.add('product-stats-footer');
    }
  }
}
