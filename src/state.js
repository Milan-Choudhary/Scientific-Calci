(function (global) {
    global.calculatorState = {
        expression: '',
        result: '0',
        history: '',
        angleMode: 'DEG',
        justSolved: false,
        hasError: false,
        soundEnabled: true,
        currencyRates: {}
    };
})(globalThis);
