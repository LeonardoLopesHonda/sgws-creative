export default function decorate(block) {
  const pics = block.querySelectorAll('picture');
  pics.forEach((pic) => {
    const picWrapper = pic.closest('div');
    if (picWrapper && picWrapper.children.length === 1) {
      picWrapper.classList.add('animate');
    }
  });
}
