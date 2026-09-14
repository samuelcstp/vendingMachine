  const STATES = [0,5,10,15,20,25];
  const PRICE = 30;
  let credit = 0;
  let awaitingDecision = false;

  const trackEl = document.getElementById('track');
  const terminalEl = document.getElementById('terminal');
  const creditEl = document.getElementById('credit-display');
  const statusPill = document.getElementById('status-pill');
  const decisionPanel = document.getElementById('decision-panel');
  const noChangeNote = document.getElementById('no-change-note');
  const productSlot = document.getElementById('product-slot');
  const productIdle = document.getElementById('product-idle');
  const coinButtons = [...document.querySelectorAll('.coin-btn')];

  function buildTrack(){
    trackEl.innerHTML = '';
    STATES.forEach((s, i) => {
      const node = document.createElement('div');
      node.className = 'state-node';
      node.dataset.state = s;
      node.textContent = s;
      trackEl.appendChild(node);
      if(i < STATES.length - 1){
        const line = document.createElement('div');
        line.className = 'track-line';
        trackEl.appendChild(line);
      }
    });
  }

  function renderState(){
    document.querySelectorAll('.state-node').forEach(n => {
      n.classList.toggle('active', Number(n.dataset.state) === credit);
    });
    creditEl.textContent = credit + '¢';
  }

  function log(text, tone = 'default'){
    const line = document.createElement('div');
    const colors = { default: '#8ff5b0', coin: '#e8e6df', warn: '#ffd76b', dispense: '#39ff88' };
    line.style.color = colors[tone] || colors.default;
    line.textContent = '> ' + text;
    terminalEl.appendChild(line);
    terminalEl.scrollTop = terminalEl.scrollHeight;
  }

  function setButtonsEnabled(enabled){
    coinButtons.forEach(b => b.disabled = !enabled);
  }

  function insertCoin(coin){
    const from = credit;
    const sum = credit + coin;
    log(`moeda inserida: ${coin}¢`, 'coin');

    if(sum >= PRICE){
      const troco = sum - PRICE;
      log(`estado ${from} --(${coin})--> DISPENSA  [soma=${sum} >= 30]`, 'dispense');
      log(`produto liberado · troco calculado: ${troco}¢`, 'dispense');
      dispenseProduct(troco);
    } else {
      credit = sum;
      log(`estado ${from} --(${coin})--> estado ${credit}`);
      renderState();
    }
  }

  function dispenseProduct(troco){
    setButtonsEnabled(false);
    statusPill.textContent = 'produto liberado';
    productIdle.classList.add('hidden');
    productSlot.classList.remove('opacity-0');
    productSlot.classList.add('drop-anim');

    credit = troco;
    renderState();

    if(troco > 0){
      decisionPanel.classList.remove('hidden');
      noChangeNote.classList.add('hidden');
      log(`aguardando decisão em estado ${troco}: retirar troco ou continuar`, 'warn');
    } else {
      noChangeNote.classList.remove('hidden');
      decisionPanel.classList.add('hidden');
      setTimeout(() => {
        resetAfterPurchase(0, false);
      }, 1400);
    }
  }

  function resetAfterPurchase(newState, logIt = true){
    credit = newState;
    renderState();
    productSlot.classList.add('opacity-0');
    productSlot.classList.remove('drop-anim');
    productIdle.classList.remove('hidden');
    statusPill.textContent = 'aguardando moedas';
    decisionPanel.classList.add('hidden');
    noChangeNote.classList.add('hidden');
    setButtonsEnabled(true);
    if(logIt) log(`estado atual: ${newState}`);
  }

  coinButtons.forEach(btn => {
    btn.addEventListener('click', () => insertCoin(Number(btn.dataset.coin)));
  });

  document.getElementById('btn-withdraw').addEventListener('click', () => {
    log(`troco de ${credit}¢ retirado --> estado 0`, 'warn');
    resetAfterPurchase(0);
  });

  document.getElementById('btn-continue').addEventListener('click', () => {
    log(`troco mantido como crédito --> estado ${credit}`, 'warn');
    resetAfterPurchase(credit);
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    terminalEl.innerHTML = '';
    resetAfterPurchase(0, false);
    log('simulação reiniciada');
  });

  buildTrack();
  renderState();
  log('simulação iniciada em estado 0');
