(function () {
    const state = globalThis.calculatorState;
    const { evaluateExpression, formatResult } = globalThis.CalciOperations;

    const display = document.querySelector('#display');
    const historyDisplay = document.querySelector('#history');
    const keypad = document.querySelector('.calculator-keys');
    const angleModeButton = document.querySelector('#angle-mode');
    const soundToggle = document.querySelector('#sound-toggle');
    const converterType = document.querySelector('#converter-type');
    const converterInput = document.querySelector('#converter-input');
    const converterFrom = document.querySelector('#converter-from');
    const converterTo = document.querySelector('#converter-to');
    const converterSwap = document.querySelector('#converter-swap');
    const converterResult = document.querySelector('#converter-result');
    const converterDetail = document.querySelector('#converter-detail');
    const converterStatus = document.querySelector('#converter-status');

    const displayMap = {
        '*': 'x',
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
            .replace(/sqrt/g, displayMap.sqrt)
            .replace(/pi/g, displayMap.pi)
            .replace(/\*/g, displayMap['*'])
            .replace(/\//g, displayMap['/']);
    }

    function updateDisplay() {
        display.value = state.expression ? normalizeForDisplay(state.expression) : state.result;
        historyDisplay.innerText = state.history;
        angleModeButton.innerText = state.angleMode;
        soundToggle.innerText = state.soundEnabled ? 'Sound' : 'Muted';
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

        const functions = ['sqrt(', 'sin(', 'cos(', 'tan(', 'log(', 'ln('];
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
            state.expression = '';
            state.justSolved = true;
            state.hasError = false;
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
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;
        if (state.soundEnabled) playClickSound();
        updateDisplay();
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

    keypad.addEventListener('click', (event) => {
        const button = event.target.closest('button');

        if (!button) return;

        handleAction(button.dataset.action, button.dataset.value);
    });

    angleModeButton.addEventListener('click', toggleAngleMode);
    soundToggle.addEventListener('click', toggleSound);
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
        }
    });

    populateConverterTypes();
    populateConverterUnits();
    updateDisplay();
})();
