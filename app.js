// Hand Cricket Game Engine (Faithful to game.java rules)
const FINGER_EMOJIS = {
  1: '☝️',
  2: '✌️',
  3: '🤟',
  4: '🖖',
  5: '🖐️',
  6: '👍'
};

const gameState = {
  userScore: 0,
  compScore: 0,
  innings: 1, // 1 or 2
  userRole: 'bat', // 'bat' or 'bowl'
  target: null,
  isGameOver: false,
  soundEnabled: true,
  wins: parseInt(localStorage.getItem('hc_wins') || '0'),
  losses: parseInt(localStorage.getItem('hc_losses') || '0'),
  recentBalls: []
};

// Audio synthesized effects using Web Audio API
const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) 
  ? new (window.AudioContext || window.webkitAudioContext)() 
  : null;

function playBeep(type) {
  if (!gameState.soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'hit') {
      osc.frequency.setValueAtTime(320, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'out') {
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'cheer') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  } catch (_) {}
}

document.addEventListener('DOMContentLoaded', () => {
  updateStatsDisplay();
  document.getElementById('btn-sound').addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    document.getElementById('btn-sound').innerHTML = gameState.soundEnabled 
      ? '<i class="fa-solid fa-volume-high"></i>' 
      : '<i class="fa-solid fa-volume-xmark"></i>';
  });
});

function updateStatsDisplay() {
  document.getElementById('stat-wins').textContent = gameState.wins;
  document.getElementById('stat-losses').textContent = gameState.losses;
}

function showScreen(screenId) {
  document.querySelectorAll('.game-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function setCommentary(text) {
  const el = document.getElementById('commentary-text');
  el.textContent = text;
}

// 1. TOSS LOGIC (from game.java)
function playToss(userChoice) {
  // 1 = Heads, 2 = Tails
  const tossResult = Math.floor(Math.random() * 2) + 1;
  const tossName = tossResult === 1 ? 'Heads' : 'Tails';

  if (userChoice === tossResult) {
    playBeep('cheer');
    setCommentary(`🪙 The coin shows ${tossName}! You won the toss! Choose whether to Bat or Bowl first.`);
    showScreen('screen-decision');
  } else {
    // Computer won toss, computer bats first as in game.java
    playBeep('hit');
    gameState.userRole = 'bowl'; // Computer bats first
    setCommentary(`🪙 The coin shows ${tossName}. Computer won the toss and decided to BAT first! Get ready to bowl.`);
    startMatch();
  }
}

// 2. USER TOSS DECISION
function chooseDecision(choice) {
  gameState.userRole = choice; // 'bat' or 'bowl'
  if (choice === 'bat') {
    setCommentary(`You elected to BAT first! Set a mammoth total for the computer.`);
  } else {
    setCommentary(`You elected to BOWL first! Take wickets early to restrict the computer.`);
  }
  startMatch();
}

function startMatch() {
  gameState.userScore = 0;
  gameState.compScore = 0;
  gameState.innings = 1;
  gameState.target = null;
  gameState.isGameOver = false;
  gameState.recentBalls = [];
  renderBallsHistory();

  updateScoreboardUI();
  showScreen('screen-play');
}

function updateScoreboardUI() {
  document.getElementById('score-user').textContent = gameState.userScore;
  document.getElementById('score-comp').textContent = gameState.compScore;

  const userRoleTag = document.getElementById('tag-user-role');
  const compRoleTag = document.getElementById('tag-comp-role');

  if (gameState.userRole === 'bat') {
    userRoleTag.textContent = 'BATTING 🏏';
    userRoleTag.style.color = 'var(--green)';
    compRoleTag.textContent = 'BOWLING ⚾';
    compRoleTag.style.color = 'var(--primary)';
    document.getElementById('action-prompt').textContent = 'Choose your run shot (1 - 6):';
  } else {
    userRoleTag.textContent = 'BOWLING ⚾';
    userRoleTag.style.color = 'var(--primary)';
    compRoleTag.textContent = 'BATTING 🏏';
    compRoleTag.style.color = 'var(--green)';
    document.getElementById('action-prompt').textContent = 'Choose your delivery ball (1 - 6):';
  }

  const stageBadge = document.getElementById('match-stage');
  const targetBadge = document.getElementById('target-badge');

  if (gameState.innings === 1) {
    stageBadge.textContent = '1ST INNINGS';
    targetBadge.textContent = 'SETTING TARGET';
  } else {
    stageBadge.textContent = '2ND INNINGS';
    targetBadge.textContent = `TARGET: ${gameState.target}`;
  }
}

// 3. MAIN INNINGS THROW LOGIC
function handleNumberInput(userNum) {
  if (gameState.isGameOver) return;

  const compNum = Math.floor(Math.random() * 6) + 1;

  // Display hand gestures
  const userHand = document.getElementById('user-hand');
  const compHand = document.getElementById('comp-hand');
  const userNumDisplay = document.getElementById('user-throw-num');
  const compNumDisplay = document.getElementById('comp-throw-num');

  userHand.textContent = FINGER_EMOJIS[userNum] || '✊';
  compHand.textContent = FINGER_EMOJIS[compNum] || '✊';
  userNumDisplay.textContent = userNum;
  compNumDisplay.textContent = compNum;

  // Pop animation
  userHand.style.transform = 'scale(1.35)';
  compHand.style.transform = 'scale(1.35)';
  setTimeout(() => {
    userHand.style.transform = 'scale(1)';
    compHand.style.transform = 'scale(1)';
  }, 200);

  const isMatch = userNum === compNum;

  if (gameState.userRole === 'bat') {
    // USER IS BATTING
    if (isMatch) {
      // OUT!
      playBeep('out');
      addRecentBall('W', 'out');
      handleBatsmanOut('user');
    } else {
      // Runs added
      playBeep('hit');
      gameState.userScore += userNum;
      addRecentBall(userNum, userNum === 6 ? 'six' : userNum === 4 ? 'four' : '');
      updateScoreboardUI();

      if (userNum === 6) {
        setCommentary(`💥 MASSIVE SIX! You hit it out of the park for 6 runs! (Total: ${gameState.userScore})`);
      } else if (userNum === 4) {
        setCommentary(`⚡ CRACKING BOUNDARY! Smashed for 4 runs! (Total: ${gameState.userScore})`);
      } else {
        setCommentary(`Quick single/runs taken! You scored ${userNum}. (Total: ${gameState.userScore})`);
      }

      // Check if chasing in 2nd innings
      if (gameState.innings === 2 && gameState.userScore >= gameState.target) {
        finishMatch('user_chased');
      }
    }
  } else {
    // COMPUTER IS BATTING (USER BOWLING)
    if (isMatch) {
      // Computer OUT!
      playBeep('out');
      addRecentBall('W', 'out');
      handleBatsmanOut('comp');
    } else {
      // Runs added to computer
      playBeep('hit');
      gameState.compScore += compNum;
      addRecentBall(compNum, compNum === 6 ? 'six' : compNum === 4 ? 'four' : '');
      updateScoreboardUI();

      if (compNum === 6) {
        setCommentary(`😱 Computer dispatched it for a MAXIMUM 6! (Computer: ${gameState.compScore})`);
      } else if (compNum === 4) {
        setCommentary(`Computer found the gap for 4 runs! (Computer: ${gameState.compScore})`);
      } else {
        setCommentary(`Computer pushed for ${compNum} runs. (Computer: ${gameState.compScore})`);
      }

      // Check if computer chased in 2nd innings
      if (gameState.innings === 2 && gameState.compScore >= gameState.target) {
        finishMatch('comp_chased');
      }
    }
  }
}

function handleBatsmanOut(who) {
  if (who === 'user') {
    document.getElementById('status-user-out').textContent = 'OUT';
    setCommentary(`☝️ OUT! You threw ${document.getElementById('user-throw-num').textContent} and Computer matched it! Your innings ends at ${gameState.userScore}.`);
  } else {
    document.getElementById('status-comp-out').textContent = 'OUT';
    setCommentary(`🎯 TIMBER! Computer is OUT! Both threw ${document.getElementById('comp-throw-num').textContent}! Computer innings ends at ${gameState.compScore}.`);
  }

  if (gameState.innings === 1) {
    // Switch to 2nd Innings
    setTimeout(() => {
      gameState.innings = 2;
      document.getElementById('status-user-out').textContent = '';
      document.getElementById('status-comp-out').textContent = '';
      gameState.recentBalls = [];
      renderBallsHistory();

      if (who === 'user') {
        gameState.target = gameState.userScore + 1;
        gameState.userRole = 'bowl';
        setCommentary(`🔄 Innings Break! Computer needs ${gameState.target} runs to win. Time to defend your total!`);
      } else {
        gameState.target = gameState.compScore + 1;
        gameState.userRole = 'bat';
        setCommentary(`🔄 Innings Break! You need ${gameState.target} runs to win. Pad up and chase it down!`);
      }
      updateScoreboardUI();
    }, 1800);
  } else {
    // 2nd innings out -> match finished
    setTimeout(() => {
      if (who === 'user') {
        finishMatch('user_fell_short');
      } else {
        finishMatch('comp_fell_short');
      }
    }, 1200);
  }
}

function finishMatch(scenario) {
  gameState.isGameOver = true;
  showScreen('screen-result');

  const titleEl = document.getElementById('result-title');
  const summaryEl = document.getElementById('result-summary');
  const iconEl = document.getElementById('result-icon');

  document.getElementById('final-user-score').textContent = gameState.userScore;
  document.getElementById('final-comp-score').textContent = gameState.compScore;

  if (scenario === 'user_chased' || scenario === 'comp_fell_short') {
    playBeep('cheer');
    gameState.wins++;
    localStorage.setItem('hc_wins', gameState.wins.toString());
    updateStatsDisplay();

    iconEl.textContent = '🏆';
    titleEl.textContent = 'VICTORY IS YOURS! 🎊';
    titleEl.style.color = 'var(--green)';

    if (scenario === 'user_chased') {
      summaryEl.textContent = `You chased down the target of ${gameState.target} with pure class!`;
    } else {
      const margin = gameState.userScore - gameState.compScore;
      summaryEl.textContent = `You defended your total and bowled out the computer by ${margin} runs!`;
    }
  } else {
    playBeep('out');
    gameState.losses++;
    localStorage.setItem('hc_losses', gameState.losses.toString());
    updateStatsDisplay();

    iconEl.textContent = '💔';
    titleEl.textContent = 'COMPUTER WON THE MATCH';
    titleEl.style.color = 'var(--red)';

    if (scenario === 'comp_chased') {
      summaryEl.textContent = `Computer chased down the target of ${gameState.target}. Hard luck!`;
    } else {
      const margin = gameState.compScore - gameState.userScore;
      summaryEl.textContent = `You were bowled out short by ${margin} runs. Better luck next game!`;
    }
  }
}

function resetGame() {
  document.getElementById('status-user-out').textContent = '';
  document.getElementById('status-comp-out').textContent = '';
  document.getElementById('user-throw-num').textContent = '-';
  document.getElementById('comp-throw-num').textContent = '-';
  document.getElementById('user-hand').textContent = '❓';
  document.getElementById('comp-hand').textContent = '❓';
  setCommentary('Toss time! Call Heads or Tails to start a new match.');
  showScreen('screen-toss');
}

function addRecentBall(text, cls) {
  gameState.recentBalls.unshift({ text, cls });
  if (gameState.recentBalls.length > 8) gameState.recentBalls.pop();
  renderBallsHistory();
}

function renderBallsHistory() {
  const container = document.getElementById('balls-history');
  container.innerHTML = gameState.recentBalls.map(b => `
    <div class="ball-dot ${b.cls}">${b.text}</div>
  `).join('');
}
