 (function(){
  // Set up launch date (Vilnius time). Launch is three days from 2025‑09‑17.
  const launchDate = new Date('2025-09-20T00:00:00+03:00');

  // Previously there was an injection date and wallet donation logic. These have been removed to avoid unrealistic promises.

  /**
   * Compute the difference parts between now and a future date.
   * @param {Date} to
   */
  function diffParts(to){
    const now = new Date();
    let diff = Math.max(0, to - now);
    const d = Math.floor(diff / (1000*60*60*24)); diff -= d * 24 * 60 * 60 * 1000;
    const h = Math.floor(diff / (1000*60*60)); diff -= h * 60 * 60 * 1000;
    const m = Math.floor(diff / (1000*60)); diff -= m * 60 * 1000;
    const s = Math.floor(diff / 1000);
    return {d,h,m,s};
  }

  // Update countdown timer every second. Only the launch timer is used.
  function updateTimer(){
    const a = diffParts(launchDate);
    document.getElementById('d1').textContent = a.d;
    document.getElementById('h1').textContent = a.h;
    document.getElementById('m1').textContent = a.m;
    document.getElementById('s1').textContent = a.s;
    setTimeout(updateTimer, 1000);
  }
  updateTimer();

  // Previously there was a live member/online counter that animated follower numbers. It has been removed to reflect the actual follower count.

  // Placeholder buy link behaviour
  document.getElementById('buy-link').addEventListener('click', function(e){
    // Insert your real pump.fun link here when available
    alert('Pump.fun link will be available on launch!');
    e.preventDefault();
  });

  // Fade‑in sections using IntersectionObserver
  // Sections with class "fade-section" start with the "hidden" class (opacity 0 and translateY). When they enter the viewport,
  // remove "hidden" and add "visible" to animate them into view.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        entry.target.classList.remove('hidden');
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.fade-section').forEach(sec => {
    observer.observe(sec);
  });
})();