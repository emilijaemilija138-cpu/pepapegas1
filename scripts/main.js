 (function(){
  // Set up launch date: 7 days from the moment the page loads.
  // This ensures the countdown always reflects “launch in 7 days” from the visitor's current time.
  const launchDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  // Prepare pump.fun link (hidden in data-url attribute on the buy button) and donation address.
  const buyLinkEl = document.getElementById('buy-link');
  const pumpLink = buyLinkEl ? buyLinkEl.getAttribute('data-url') : '#';
  const donationAddress = '89Ju46QxZ2J72QZ3SciRg6oSF2V9wVLipqESJcm5V44b';
  const donateAddrEl = document.getElementById('donateAddress');
  if (donateAddrEl) donateAddrEl.textContent = donationAddress;
  const copyDonateBtn = document.getElementById('copyDonateBtn');

  // When the copy button is clicked, copy the donation address to clipboard and show feedback
  if (copyDonateBtn) {
    copyDonateBtn.addEventListener('click', function(){
      if (navigator.clipboard && donationAddress) {
        navigator.clipboard.writeText(donationAddress).then(function(){
          const original = copyDonateBtn.textContent;
          copyDonateBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyDonateBtn.textContent = original;
          }, 2000);
        });
      }
    });
  }

  // Prevent navigating when the buy link is disabled
  if (buyLinkEl) {
    buyLinkEl.addEventListener('click', function(e){
      if (buyLinkEl.classList.contains('disabled')) {
        e.preventDefault();
      }
    });
  }

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
    const parts = diffParts(launchDate);
    document.getElementById('d1').textContent = parts.d;
    document.getElementById('h1').textContent = parts.h;
    document.getElementById('m1').textContent = parts.m;
    document.getElementById('s1').textContent = parts.s;

    // Enable the buy button when countdown reaches zero (or is in the past).
    const now = new Date();
    if (buyLinkEl) {
      if (now >= launchDate) {
        // Set the real link and remove disabled state
        buyLinkEl.setAttribute('href', pumpLink);
        buyLinkEl.classList.remove('disabled');
        buyLinkEl.removeAttribute('title');
      } else {
        // Keep disabled
        buyLinkEl.setAttribute('href', '#');
        buyLinkEl.classList.add('disabled');
        buyLinkEl.setAttribute('title', 'Available after launch');
      }
    }
    setTimeout(updateTimer, 1000);
  }
  updateTimer();

  // Previously there was a live member/online counter that animated follower numbers. It has been removed to reflect the actual follower count.

  // No placeholder alert for the buy link. Behaviour is controlled by disabling/enabling via the timer above.

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