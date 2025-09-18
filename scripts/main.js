 (function(){
  // Set up launch date: persist across sessions. If a launch date exists in localStorage, use it;
  // otherwise set it to 7 days from now and store it. This ensures the countdown runs until
  // the same launch date for returning visitors.
  let launchDate;
  const storedLaunch = localStorage.getItem('launchDate');
  if (storedLaunch) {
    launchDate = new Date(storedLaunch);
  } else {
    launchDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('launchDate', launchDate.toISOString());
  }

  // Prepare pump.fun link (hidden in data-url attribute on the buy button) and donation address.
  const buyLinkEl = document.getElementById('buy-link');
  const pumpLink = buyLinkEl ? buyLinkEl.getAttribute('data-url') : '#';
  const donationAddress = '89Ju46QxZ2J72QZ3SciRg6oSF2V9wVLipqESJcm5V44b';
  const donateAddrEl = document.getElementById('donateAddress');
  if (donateAddrEl) donateAddrEl.textContent = donationAddress;
  const copyDonateBtn = document.getElementById('copyDonateBtn');

  // Track total coins collected across game sessions. Use localStorage to persist.
  const totalCoinsEl = document.getElementById('totalCoinsDisplay');
  function loadTotalCoins(){
    const tc = parseFloat(localStorage.getItem('playerCoins') || '0');
    if (totalCoinsEl) totalCoinsEl.textContent = Math.floor(tc);
  }
  // Initialize total coins display
  loadTotalCoins();

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

  /*
   * ==== Mini Game: Collect Coins ==== 
   * A simple side‑scrolling game where the player controls PepePegasus using the left and right arrow keys.
   * Coins fall from the top; catching them increments a fractional coin counter which, over time,
   * accumulates to whole coins (approx. 10k coins per 24 hours of continuous play). Obstacles also fall;
   * hitting one ends the game. After the game ends, players can optionally enter their name or Gmail for
   * the local leaderboard. No data is sent to any server; all data remains in the user's browser.
   */
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startGameBtn');
    const gameOverEl = document.getElementById('game-over');
    const finalScoreEl = document.getElementById('finalScore');
    const gameScoreEl = document.getElementById('gameScore');
    const playerNameInput = document.getElementById('playerName');
    const submitScoreBtn = document.getElementById('submitScoreBtn');
    const leaderboardEl = document.getElementById('leaderboard');

    let gameInterval, spawnCoinInterval, spawnObstacleInterval;
    const player = { x: canvas.width / 2 - 20, y: canvas.height - 40, width: 40, height: 40, speed: 5 };
    const keys = {};
    let coins = [];
    let obstacles = [];
    let coinFraction = 0;
    let score = 0;
    let gameRunning = false;

    function resetGame(){
      player.x = canvas.width / 2 - 20;
      coins = [];
      obstacles = [];
      coinFraction = 0;
      score = 0;
      gameScoreEl.textContent = '0';
    }

    function startGame(){
      resetGame();
      gameRunning = true;
      if (gameOverEl) gameOverEl.classList.add('hidden');
      // Start intervals
      gameInterval = setInterval(updateGame, 20); // 50fps
      spawnCoinInterval = setInterval(spawnCoin, 1000); // coin every second
      spawnObstacleInterval = setInterval(spawnObstacle, 1500); // obstacle
    }

    function endGame(){
      gameRunning = false;
      clearInterval(gameInterval);
      clearInterval(spawnCoinInterval);
      clearInterval(spawnObstacleInterval);
      // Show game over dialog and update the final score
      if (gameOverEl) gameOverEl.classList.remove('hidden');
      if (finalScoreEl) finalScoreEl.textContent = score;
      // Add collected coins to cumulative total stored in localStorage
      try {
        const currentTotal = parseFloat(localStorage.getItem('playerCoins') || '0');
        const newTotal = currentTotal + score;
        localStorage.setItem('playerCoins', newTotal);
      } catch(e){
        // If localStorage is not available, silently ignore
      }
      // Refresh the total coins display
      loadTotalCoins();
    }

    if (startBtn){
      startBtn.addEventListener('click', function(){
        if(!gameRunning) startGame();
      });
    }

    function spawnCoin(){
      const x = Math.random() * (canvas.width - 20);
      coins.push({ x: x, y: -20, radius: 8 });
    }
    function spawnObstacle(){
      const w = 30 + Math.random() * 20;
      const h = 20 + Math.random() * 20;
      const x = Math.random() * (canvas.width - w);
      obstacles.push({ x: x, y: -20, width: w, height: h });
    }

    document.addEventListener('keydown', function(e){
      keys[e.code] = true;
    });
    document.addEventListener('keyup', function(e){
      keys[e.code] = false;
    });

    function updateGame(){
      // Move player
      if(keys['ArrowLeft']) player.x -= player.speed;
      if(keys['ArrowRight']) player.x += player.speed;
      // Bound player
      player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
      // Update coins
      for(let i = coins.length - 1; i >= 0; i--){
        const c = coins[i];
        c.y += 2;
        // Collision with player
        if(c.y + c.radius > player.y && c.y - c.radius < player.y + player.height &&
           c.x + c.radius > player.x && c.x - c.radius < player.x + player.width){
          // Collect coin: add fractional value
          coinFraction += 0.115;
          if(coinFraction >= 1){
            const whole = Math.floor(coinFraction);
            score += whole;
            coinFraction -= whole;
            gameScoreEl.textContent = score;
          }
          coins.splice(i, 1);
        } else if(c.y - c.radius > canvas.height){
          coins.splice(i, 1);
        }
      }
      // Update obstacles
      for(let i = obstacles.length - 1; i >= 0; i--){
        const o = obstacles[i];
        o.y += 3;
        // Collision with player
        if(o.y + o.height > player.y && o.y < player.y + player.height &&
           o.x + o.width > player.x && o.x < player.x + player.width){
          endGame();
          return;
        } else if(o.y > canvas.height){
          obstacles.splice(i, 1);
        }
      }
      drawGame();
    }

    function drawGame(){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw player
      ctx.fillStyle = '#4caf50';
      ctx.fillRect(player.x, player.y, player.width, player.height);
      // Draw coins
      ctx.fillStyle = '#ffd700';
      coins.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      // Draw obstacles
      ctx.fillStyle = '#ff5252';
      obstacles.forEach(o => {
        ctx.fillRect(o.x, o.y, o.width, o.height);
      });
    }

    // Leaderboard management
    function loadLeaderboard(){
      try {
        return JSON.parse(localStorage.getItem('pepeLeaderboard') || '[]');
      } catch(e){
        return [];
      }
    }
    function saveLeaderboard(data){
      localStorage.setItem('pepeLeaderboard', JSON.stringify(data));
    }
    function updateLeaderboard(){
      const data = loadLeaderboard().sort((a,b) => b.score - a.score).slice(0, 10);
      if(leaderboardEl){
        leaderboardEl.innerHTML = '';
        data.forEach(item => {
          const li = document.createElement('li');
          li.textContent = `${item.name || 'Anonymous'} — ${item.score} coins`;
          leaderboardEl.appendChild(li);
        });
      }
    }
    if(submitScoreBtn){
      submitScoreBtn.addEventListener('click', function(){
        const name = playerNameInput ? playerNameInput.value.trim() : '';
        const data = loadLeaderboard();
        data.push({ name: name, score: score });
        saveLeaderboard(data);
        updateLeaderboard();
        if(playerNameInput) playerNameInput.value = '';
        if(gameOverEl) gameOverEl.classList.add('hidden');
      });
    }
    updateLeaderboard();
  }

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