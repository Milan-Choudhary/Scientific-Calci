(function () {
    const state = globalThis.calculatorState;
    const { evaluateExpression, formatResult } = globalThis.CalciOperations;

    const display = document.querySelector('#display');
    const historyDisplay = document.querySelector('#history');
    const keypad = document.querySelector('.calculator-keys');
    const memoryRow = document.querySelector('.memory-row');
    const screenTools = document.querySelector('.screen-tools');
    const angleModeButton = document.querySelector('#angle-mode');
    const soundToggle = document.querySelector('#sound-toggle');
    const themeToggle = document.querySelector('#theme-toggle');
    const secondToggle = document.querySelector('#second-toggle');
    const copyResultButton = document.querySelector('#copy-result');
    const historyToggle = document.querySelector('#history-toggle');
    const historyPanel = document.querySelector('#history-panel');
    const historyList = document.querySelector('#history-list');
    const historyClear = document.querySelector('#history-clear');
    const memoryIndicator = document.querySelector('#memory-indicator');
    const swapButtons = Array.from(document.querySelectorAll('.science.swap'));

    const STORAGE_KEY = 'scientific-calci-settings';
    const MAX_HISTORY = 30;
    const converterType = document.querySelector('#converter-type');
    const converterInput = document.querySelector('#converter-input');
    const converterFrom = document.querySelector('#converter-from');
    const converterTo = document.querySelector('#converter-to');
    const converterSwap = document.querySelector('#converter-swap');
    const converterResult = document.querySelector('#converter-result');
    const converterDetail = document.querySelector('#converter-detail');
    const converterStatus = document.querySelector('#converter-status');

    const displayMap = {
        '*': '\u00d7',
        '/': '\u00f7',
        pi: '\u03c0',
        sqrt: '\u221a'
    };

    const converterGroups = {
        temperature: {
            label: 'Temperature',
            units: {
                c: { label: 'Celsius', toBase: (value) => value, fromBase: (value) => value },
                f: { label: 'Fahrenheit', toBase: (value) => (value - 32) * 5 / 9, fromBase: (value) => (value * 9 / 5) + 32 },
                k: { label: 'Kelvin', toBase: (value) => value - 273.15, fromBase: (value) => value + 273.15 }
            }
        },
        weight: {
            label: 'Weight',
            units: {
                kg: { label: 'Kilogram', factor: 1 },
                g: { label: 'Gram', factor: 0.001 },
                lb: { label: 'Pound', factor: 0.45359237 },
                oz: { label: 'Ounce', factor: 0.028349523125 },
                tonne: { label: 'Tonne', factor: 1000 }
            }
        },
        length: {
            label: 'Length',
            units: {
                m: { label: 'Meter', factor: 1 },
                km: { label: 'Kilometer', factor: 1000 },
                cm: { label: 'Centimeter', factor: 0.01 },
                mm: { label: 'Millimeter', factor: 0.001 },
                in: { label: 'Inch', factor: 0.0254 },
                ft: { label: 'Foot', factor: 0.3048 },
                mi: { label: 'Mile', factor: 1609.344 }
            }
        },
        area: {
            label: 'Area',
            units: {
                sqm: { label: 'Square meter', factor: 1 },
                sqkm: { label: 'Square kilometer', factor: 1000000 },
                sqft: { label: 'Square foot', factor: 0.09290304 },
                acre: { label: 'Acre', factor: 4046.8564224 },
                hectare: { label: 'Hectare', factor: 10000 }
            }
        },
        volume: {
            label: 'Volume',
            units: {
                l: { label: 'Liter', factor: 1 },
                ml: { label: 'Milliliter', factor: 0.001 },
                m3: { label: 'Cubic meter', factor: 1000 },
                gal: { label: 'US gallon', factor: 3.785411784 },
                cup: { label: 'US cup', factor: 0.2365882365 }
            }
        },
        speed: {
            label: 'Speed',
            units: {
                mps: { label: 'Meter/sec', factor: 1 },
                kph: { label: 'Kilometer/hour', factor: 0.2777777778 },
                mph: { label: 'Mile/hour', factor: 0.44704 },
                knot: { label: 'Knot', factor: 0.5144444444 }
            }
        },
        time: {
            label: 'Time',
            units: {
                s: { label: 'Second', factor: 1 },
                min: { label: 'Minute', factor: 60 },
                hr: { label: 'Hour', factor: 3600 },
                day: { label: 'Day', factor: 86400 },
                week: { label: 'Week', factor: 604800 }
            }
        },
        currency: {
            label: 'Currency',
            units: {
                USD: { label: 'US dollar' },
                INR: { label: 'Indian rupee' },
                EUR: { label: 'Euro' },
                GBP: { label: 'British pound' },
                JPY: { label: 'Japanese yen' },
                AUD: { label: 'Australian dollar' },
                CAD: { label: 'Canadian dollar' },
                SGD: { label: 'Singapore dollar' }
            },
            fallbackRates: {
                USD: 1,
                INR: 83.2,
                EUR: 0.92,
                GBP: 0.79,
                JPY: 155,
                AUD: 1.5,
                CAD: 1.36,
                SGD: 1.35
            }
        }
    };

    let audioContext = null;

    function normalizeForDisplay(expression) {
        return expression
            .replace(/asin/g, 'sin\u207b\u00b9')
            .replace(/acos/g, 'cos\u207b\u00b9')
            .replace(/atan/g, 'tan\u207b\u00b9')
            .replace(/sqrt/g, displayMap.sqrt)
            .replace(/pi/g, displayMap.pi)
            .replace(/mod/g, ' mod ')
            .replace(/\*/g, displayMap['*'])
            .replace(/\//g, displayMap['/']);
    }

    function updateDisplay() {
        display.value = state.expression ? normalizeForDisplay(state.expression) : state.result;
        historyDisplay.innerText = state.history;
        angleModeButton.innerText = state.angleMode;
        soundToggle.innerText = state.soundEnabled ? '\ud83d\udd0a Sound' : '\ud83d\udd07 Muted';
        themeToggle.innerText = state.theme === 'dark' ? '\u263d Dark' : '\u2600 Light';
        display.classList.toggle('is-error', state.hasError);
        memoryIndicator.classList.toggle('is-active', state.memory !== 0);
    }

    let toastTimer = null;

    function showToast(message) {
        let toast = document.querySelector('.toast');

        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.innerText = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1600);
    }

    function applyTheme() {
        document.documentElement.dataset.theme = state.theme;
    }

    function persistSettings() {
        try {
            const payload = {
                angleMode: state.angleMode,
                soundEnabled: state.soundEnabled,
                theme: state.theme,
                memory: state.memory,
                historyLog: state.historyLog
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (error) {
            /* localStorage may be unavailable; ignore */
        }
    }

    function loadSettings() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

            if (saved.angleMode === 'DEG' || saved.angleMode === 'RAD') state.angleMode = saved.angleMode;
            if (typeof saved.soundEnabled === 'boolean') state.soundEnabled = saved.soundEnabled;
            if (saved.theme === 'dark' || saved.theme === 'light') state.theme = saved.theme;
            if (typeof saved.memory === 'number' && Number.isFinite(saved.memory)) state.memory = saved.memory;
            if (Array.isArray(saved.historyLog)) state.historyLog = saved.historyLog.slice(0, MAX_HISTORY);
        } catch (error) {
            /* corrupt or unavailable storage; keep defaults */
        }
    }

    function playClickSound(kind = 'tap') {
        if (!state.soundEnabled) return;

        audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();

        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        const now = audioContext.currentTime;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(kind === 'equals' ? 660 : 420, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(kind === 'equals' ? 0.08 : 0.045, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.09);
    }

    function resetCalculator() {
        state.expression = '';
        state.result = '0';
        state.history = '';
        state.justSolved = false;
        state.hasError = false;
        updateDisplay();
    }

    function prepareForInput() {
        if (state.hasError || state.justSolved) {
            state.expression = '';
            state.history = '';
            state.justSolved = false;
            state.hasError = false;
        }
    }

    function appendValue(value) {
        prepareForInput();
        state.expression += value;
        updateDisplay();
    }

    function appendOperator(operator) {
        if (state.hasError) resetCalculator();

        if (state.justSolved) {
            state.expression = state.result;
            state.justSolved = false;
        }

        const last = state.expression.slice(-1);

        if (!state.expression && operator !== '-') return;
        if ('+-*/^'.includes(last)) {
            state.expression = state.expression.slice(0, -1) + operator;
        } else {
            state.expression += operator;
        }

        updateDisplay();
    }

    function appendDecimal() {
        prepareForInput();

        const currentNumber = state.expression.match(/(\d+\.?\d*|\.\d*)$/)?.[0] || '';

        if (currentNumber.includes('.')) return;

        state.expression += currentNumber ? '.' : '0.';
        updateDisplay();
    }

    function appendFunction(name) {
        prepareForInput();
        state.expression += `${name}(`;
        updateDisplay();
    }

    function deleteLast() {
        if (state.hasError || state.justSolved) {
            resetCalculator();
            return;
        }

        const functions = ['sqrt(', 'sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', 'abs(', 'inv(', '10^', 'e^', 'mod'];
        const found = functions.find((name) => state.expression.endsWith(name));

        state.expression = found
            ? state.expression.slice(0, -found.length)
            : state.expression.slice(0, -1);

        updateDisplay();
    }

    function toggleSign() {
        if (!state.expression || state.hasError) return;

        if (state.expression.startsWith('-(') && state.expression.endsWith(')')) {
            state.expression = state.expression.slice(2, -1);
        } else {
            state.expression = `-(${state.expression})`;
        }

        state.justSolved = false;
        updateDisplay();
    }

    function solveExpression() {
        if (!state.expression || state.hasError) return;

        try {
            const cleanExpression = state.expression.replace(/\($/, '');
            const result = evaluateExpression(cleanExpression, state.angleMode);

            state.history = `${normalizeForDisplay(cleanExpression)} =`;
            state.result = formatResult(result);
            state.lastAnswer = state.result;
            state.expression = '';
            state.justSolved = true;
            state.hasError = false;
            recordHistory(normalizeForDisplay(cleanExpression), state.result);
        } catch (error) {
            state.history = normalizeForDisplay(state.expression);
            state.result = 'Error';
            state.expression = '';
            state.justSolved = false;
            state.hasError = true;
        }

        updateDisplay();
    }

    function toggleAngleMode() {
        playClickSound();
        state.angleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
        updateDisplay();
        persistSettings();
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) playClickSound();
        updateDisplay();
        persistSettings();
    }

    function toggleTheme() {
        playClickSound();
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        applyTheme();
        updateDisplay();
        persistSettings();
    }

    function toggleSecondMode() {
        playClickSound();
        state.secondMode = !state.secondMode;
        secondToggle.classList.toggle('is-active', state.secondMode);

        swapButtons.forEach((button) => {
            const useAlt = state.secondMode;
            const action = useAlt ? button.dataset.altAction : button.dataset.action;
            const value = useAlt ? button.dataset.altValue : button.dataset.value;
            const label = useAlt ? button.dataset.altLabel : button.dataset.baseLabel;

            button.dataset.activeAction = action;
            button.dataset.activeValue = value;
            button.innerHTML = label;
        });
    }

    function insertPostfix(value) {
        if (state.hasError) resetCalculator();

        if (state.justSolved) {
            state.expression = state.result;
            state.justSolved = false;
        }

        state.expression += value;
        updateDisplay();
    }

    function applyUnary(name) {
        if (state.hasError) resetCalculator();

        if (state.justSolved) {
            state.expression = `${name}(${state.result})`;
            state.justSolved = false;
        } else {
            state.expression += `${name}(`;
        }

        updateDisplay();
    }

    function insertAnswer() {
        prepareForInput();
        state.expression += state.lastAnswer;
        updateDisplay();
    }

    function currentValue() {
        if (state.expression) {
            try {
                return evaluateExpression(state.expression.replace(/\($/, ''), state.angleMode);
            } catch (error) {
                return null;
            }
        }

        const fromResult = Number(state.lastAnswer);
        return Number.isFinite(fromResult) ? fromResult : null;
    }

    function handleMemory(action) {
        if (action === 'mem-clear') {
            state.memory = 0;
            showToast('Memory cleared');
        } else if (action === 'mem-recall') {
            prepareForInput();
            state.expression += formatResult(state.memory);
            updateDisplay();
        } else {
            const value = currentValue();

            if (value === null || !Number.isFinite(value)) {
                showToast('Nothing to store');
                return;
            }

            if (action === 'mem-add') state.memory += value;
            else if (action === 'mem-sub') state.memory -= value;
            else if (action === 'mem-store') state.memory = value;

            showToast(`Memory: ${formatResult(state.memory)}`);
        }

        updateDisplay();
        persistSettings();
    }

    function recordHistory(expression, result) {
        state.historyLog.unshift({ expression, result });
        state.historyLog = state.historyLog.slice(0, MAX_HISTORY);
        renderHistory();
        persistSettings();
    }

    function renderHistory() {
        historyList.innerHTML = '';

        if (!state.historyLog.length) {
            const empty = document.createElement('li');
            empty.className = 'history-empty';
            empty.innerText = 'No calculations yet.';
            historyList.appendChild(empty);
            return;
        }

        state.historyLog.forEach((entry) => {
            const item = document.createElement('li');
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'history-entry';
            button.innerHTML = `<span class="history-expr">${entry.expression}</span>` +
                `<span class="history-res">= ${entry.result}</span>`;
            button.addEventListener('click', () => {
                playClickSound();
                prepareForInput();
                state.expression += entry.result;
                state.justSolved = false;
                updateDisplay();
            });
            item.appendChild(button);
            historyList.appendChild(item);
        });
    }

    function clearHistory() {
        playClickSound();
        state.historyLog = [];
        renderHistory();
        persistSettings();
        showToast('History cleared');
    }

    function toggleHistory() {
        playClickSound();
        const open = historyPanel.hasAttribute('hidden');

        if (open) {
            historyPanel.removeAttribute('hidden');
        } else {
            historyPanel.setAttribute('hidden', '');
        }

        historyToggle.setAttribute('aria-expanded', String(open));
        historyToggle.classList.toggle('is-active', open);
    }

    async function copyResult() {
        playClickSound();
        const text = state.expression ? normalizeForDisplay(state.expression) : state.result;

        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard');
        } catch (error) {
            showToast('Copy not available');
        }
    }

    function handleAction(action, value) {
        playClickSound(action === 'equals' ? 'equals' : 'tap');

        switch (action) {
            case 'digit':
            case 'constant':
            case 'paren':
                appendValue(value);
                break;
            case 'operator':
                appendOperator(value);
                break;
            case 'decimal':
                appendDecimal();
                break;
            case 'function':
                appendFunction(value);
                break;
            case 'percent':
                appendValue('%');
                break;
            case 'insert':
                insertPostfix(value);
                break;
            case 'unary':
                applyUnary(value);
                break;
            case 'answer':
                insertAnswer();
                break;
            case 'clear':
                resetCalculator();
                break;
            case 'delete':
                deleteLast();
                break;
            case 'sign':
                toggleSign();
                break;
            case 'equals':
                solveExpression();
                break;
            case 'mem-clear':
            case 'mem-recall':
            case 'mem-add':
            case 'mem-sub':
            case 'mem-store':
                handleMemory(action);
                break;
        }
    }

    function formatConverterValue(value) {
        if (!Number.isFinite(value)) return 'Invalid';

        const rounded = Number.parseFloat(value.toPrecision(12));

        return Math.abs(rounded) >= 100000000 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 0.000001)
            ? rounded.toExponential(6)
            : String(rounded);
    }

    function populateConverterTypes() {
        Object.entries(converterGroups).forEach(([key, group]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = group.label;
            converterType.appendChild(option);
        });
    }

    function populateConverterUnits() {
        const group = converterGroups[converterType.value];

        converterFrom.innerHTML = '';
        converterTo.innerHTML = '';

        Object.entries(group.units).forEach(([key, unit]) => {
            const fromOption = document.createElement('option');
            const toOption = document.createElement('option');

            fromOption.value = key;
            toOption.value = key;
            fromOption.textContent = unit.label;
            toOption.textContent = unit.label;

            converterFrom.appendChild(fromOption);
            converterTo.appendChild(toOption);
        });

        converterTo.selectedIndex = Math.min(1, converterTo.options.length - 1);
        updateConverter();
    }

    function convertUnit(amount, group, from, to) {
        const fromUnit = group.units[from];
        const toUnit = group.units[to];

        if (fromUnit.toBase && toUnit.fromBase) {
            return toUnit.fromBase(fromUnit.toBase(amount));
        }

        return amount * fromUnit.factor / toUnit.factor;
    }

    async function convertCurrency(amount, from, to) {
        if (from === to) return { value: amount, source: 'same currency' };

        const cacheKey = `${from}-${to}`;

        if (state.currencyRates[cacheKey]) {
            return { value: amount * state.currencyRates[cacheKey], source: 'cached live rate' };
        }

        try {
            const response = await fetch(`https://api.frankfurter.dev/v2/rate/${from}/${to}`);

            if (!response.ok) throw new Error('Rate unavailable');

            const data = await response.json();
            state.currencyRates[cacheKey] = data.rate;
            return { value: amount * data.rate, source: `live rate ${data.date || ''}`.trim() };
        } catch (error) {
            const rates = converterGroups.currency.fallbackRates;
            const rate = rates[to] / rates[from];
            return { value: amount * rate, source: 'offline estimate' };
        }
    }

    async function updateConverter() {
        const type = converterType.value;
        const group = converterGroups[type];
        const amount = Number(converterInput.value);
        const from = converterFrom.value;
        const to = converterTo.value;

        if (!Number.isFinite(amount)) {
            converterResult.innerText = 'Invalid';
            converterDetail.innerText = 'Enter a valid number.';
            return;
        }

        if (type === 'currency') {
            converterStatus.innerText = 'Fetching';
            const { value, source } = await convertCurrency(amount, from, to);
            converterResult.innerText = formatConverterValue(value);
            converterDetail.innerText = `${amount} ${from} to ${to}`;
            converterStatus.innerText = source;
            return;
        }

        const value = convertUnit(amount, group, from, to);
        converterResult.innerText = formatConverterValue(value);
        converterDetail.innerText = `${group.units[from].label} to ${group.units[to].label}`;
        converterStatus.innerText = 'Ready';
    }

    function swapConverterUnits() {
        playClickSound();

        const from = converterFrom.value;
        converterFrom.value = converterTo.value;
        converterTo.value = from;
        updateConverter();
    }

    function onKeyButtonClick(event) {
        const button = event.target.closest('button');

        if (!button || !button.dataset.action) return;

        const action = button.dataset.activeAction || button.dataset.action;
        const value = button.dataset.activeValue || button.dataset.value;
        handleAction(action, value);
    }

    keypad.addEventListener('click', onKeyButtonClick);
    memoryRow.addEventListener('click', onKeyButtonClick);
    screenTools.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        handleAction(button.dataset.action, button.dataset.value);
    });

    angleModeButton.addEventListener('click', toggleAngleMode);
    soundToggle.addEventListener('click', toggleSound);
    themeToggle.addEventListener('click', toggleTheme);
    secondToggle.addEventListener('click', toggleSecondMode);
    copyResultButton.addEventListener('click', copyResult);
    display.addEventListener('click', copyResult);
    historyToggle.addEventListener('click', toggleHistory);
    historyClear.addEventListener('click', clearHistory);
    converterType.addEventListener('change', () => {
        playClickSound();
        populateConverterUnits();
    });
    converterInput.addEventListener('input', updateConverter);
    converterFrom.addEventListener('change', updateConverter);
    converterTo.addEventListener('change', updateConverter);
    converterSwap.addEventListener('click', swapConverterUnits);

    document.addEventListener('keydown', (event) => {
        if (['INPUT', 'SELECT'].includes(event.target.tagName)) return;

        const key = event.key;

        if (/^\d$/.test(key)) {
            appendValue(key);
        } else if (['+', '-', '*', '/', '^'].includes(key)) {
            appendOperator(key);
        } else if (key === '.') {
            appendDecimal();
        } else if (key === '(' || key === ')') {
            appendValue(key);
        } else if (key === 'Enter' || key === '=') {
            event.preventDefault();
            playClickSound('equals');
            solveExpression();
        } else if (key === 'Backspace') {
            playClickSound();
            deleteLast();
        } else if (key === 'Escape') {
            playClickSound();
            resetCalculator();
        } else if (key === '%') {
            appendValue('%');
        } else if (key === '!') {
            insertPostfix('!');
        }
    });

    swapButtons.forEach((button) => {
        button.dataset.baseLabel = button.innerHTML;
        button.dataset.activeAction = button.dataset.action;
        button.dataset.activeValue = button.dataset.value;
    });

    loadSettings();
    applyTheme();
    renderHistory();
    populateConverterTypes();
    populateConverterUnits();
    updateDisplay();
})();
