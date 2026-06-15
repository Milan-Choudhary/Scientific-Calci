(function (global) {
    global.calculatorState = {
        expression: '',
        result: '0',
        lastAnswer: '0',
        history: '',
        angleMode: 'DEG',
        justSolved: false,
        hasError: false,
        soundEnabled: true,
        theme: 'dark',
        secondMode: false,
        memory: 0,
        historyLog: [],
        currencyRates: {}
    };
})(globalThis);
