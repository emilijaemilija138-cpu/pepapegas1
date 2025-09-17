(function(){
  // Set up launch and injection dates (Vilnius time). Launch is three days from 2025‑09‑17.
  const launchDate = new Date('2025-09-20T00:00:00+03:00');
  const injectDate = new Date(launchDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Injection amount (total funds planned to be injected after 7 days)
  const injectionAmount = 1000000; // €1,000,000

  // Wallet donation variables
  const walletAddress = 'Solana.36sK5NMZG7ZbdKTvdvU1hUJQXfrqtfL81zigYsVvkyvG'; // Solana wallet address provided by the user
  const walletStart = 10000; // starting funds (10k)
  let walletValue = walletStart;

  // DOM references for wallet section
  const $walletAmount = document.getElementById('walletAmount');
  const $progressBar = document.getElementById('progressBar');
  const $walletAddrEl = document.getElementById('walletAddress');
  const copyBtn = document.getElementById('copyAddressBtn');

  // If wallet elements exist, initialize them
  if($walletAddrEl){
    $walletAddrEl.textContent = walletAddress;
  }

  // Update wallet amount and progress bar periodically
  function tickWallet(){
    if(!$walletAmount || !$progressBar) return;
    // random step with upward bias and occasional dip
    let step = Math.floor(Math.random() * 2000 + 500); // 500 .. 2500
    if(Math.random() < 0.06) step *= -1; // small chance to decrease
    walletValue = Math.max(walletStart, walletValue + step);
    $walletAmount.textContent = '€' + walletValue.toLocaleString('en-US');
    const progress = Math.min(1, walletValue / injectionAmount);
    $progressBar.style.width = (progress * 100).toFixed(2) + '%';
    setTimeout(tickWallet, Math.random() * 2000 + 1500);
  }
  if($walletAmount && $progressBar) tickWallet();

  // Copy wallet address to clipboard on button click
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      if(navigator.clipboard && walletAddress){
        navigator.clipboard.writeText(walletAddress).then(function(){
          // Provide quick feedback to the user
          const original = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = original;
          }, 2000);
        });
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

  // Update countdown timers every second
  function updateTimers(){
    const a = diffParts(launchDate);
    const b = diffParts(injectDate);
    document.getElementById('d1').textContent = a.d;
    document.getElementById('h1').textContent = a.h;
    document.getElementById('m1').textContent = a.m;
    document.getElementById('s1').textContent = a.s;
    document.getElementById('d2').textContent = b.d;
    document.getElementById('h2').textContent = b.h;
    document.getElementById('m2').textContent = b.m;
    document.getElementById('s2').textContent = b.s;
    setTimeout(updateTimers, 1000);
  }
  updateTimers();

  // Live members random walk variables
  const $m = document.getElementById('memberCount');
  const $o = document.getElementById('onlineNow');
  let n = 10867;         // starting members
  let phase = 1;         // 1:→50k, 2:→100k
  let pct = 7;           // online percentage 3–12%

  // Increase the bias toward growth near launch
  function timeFactor(){
    const now = new Date();
    const left = Math.max(0, launchDate - now);
    const p = 1 - Math.min(1, left / (7 * 24 * 60 * 60 * 1000)); // 0→1 in last 7 days
    return Math.min(2.2, 1 + p * 1.2);
  }

  // Random walk update for members and online count
  function tickMembers(){
    const tf = timeFactor();
    const target = phase === 1 ? 50000 : 100000;
    // random step with upward bias and time factor
    let step = Math.floor((Math.random() * 1200) - 220); // -220..979
    if(n < target) step += Math.floor(150 * tf);
    if(Math.random() < 0.08) step -= Math.floor(200 * tf); // occasional dip
    n = Math.max(10001, Math.min(100003, n + step));
    if(n % 2 === 0) n += 1; // keep odd
    $m.textContent = n.toLocaleString('en-US');

    // Phase change when reaching ~50k
    if(phase === 1 && n >= 50000 - 600) phase = 2;

    // online % drifts between 3–12, rises a bit near launch
    const drift = (Math.random() * 0.8 - 0.4); // -0.4..0.4
    const tfBoost = (timeFactor() - 1) * 2; // small lift near launch
    pct = Math.max(3, Math.min(12, pct + drift + tfBoost * 0.05));
    const online = Math.max(1, Math.floor(n * pct / 100));
    $o.textContent = online.toLocaleString('en-US');

    const delay = Math.max(450, (800 + Math.random() * 1200) / tf); // faster near launch
    setTimeout(tickMembers, delay);
  }
  tickMembers();

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