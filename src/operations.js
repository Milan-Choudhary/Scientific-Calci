(function (global) {
    const OPERATORS = {
        '+': { precedence: 2, associativity: 'left', args: 2, run: (a, b) => a + b },
        '-': { precedence: 2, associativity: 'left', args: 2, run: (a, b) => a - b },
        '*': { precedence: 3, associativity: 'left', args: 2, run: (a, b) => a * b },
        '/': {
            precedence: 3,
            associativity: 'left',
            args: 2,
            run: (a, b) => {
                if (b === 0) throw new Error('Cannot divide by zero');
                return a / b;
            }
        },
        '^': { precedence: 4, associativity: 'right', args: 2, run: (a, b) => Math.pow(a, b) },
        'u-': { precedence: 5, associativity: 'right', args: 1, run: (a) => -a },
        '%': { precedence: 6, associativity: 'left', args: 1, run: (a) => a / 100 }
    };

    const FUNCTIONS = {
        sin: (value, mode) => Math.sin(toRadians(value, mode)),
        cos: (value, mode) => Math.cos(toRadians(value, mode)),
        tan: (value, mode) => Math.tan(toRadians(value, mode)),
        sqrt: (value) => {
            if (value < 0) throw new Error('Invalid square root');
            return Math.sqrt(value);
        },
        log: (value) => {
            if (value <= 0) throw new Error('Invalid logarithm');
            return Math.log10(value);
        },
        ln: (value) => {
            if (value <= 0) throw new Error('Invalid logarithm');
            return Math.log(value);
        }
    };

    function toRadians(value, mode) {
        return mode === 'DEG' ? value * (Math.PI / 180) : value;
    }

    function isNumberToken(token) {
        return /^\d*\.?\d+(e[+-]?\d+)?$/i.test(token);
    }

    function isValueToken(token) {
        return isNumberToken(token) || token === 'pi' || token === 'e' || token === ')';
    }

    function addImplicitMultiplication(tokens, token) {
        const previous = tokens[tokens.length - 1];
        const startsValue = isNumberToken(token) || token === 'pi' || token === 'e' || token === '(' || FUNCTIONS[token];

        if (previous && isValueToken(previous) && startsValue && token !== '%') {
            tokens.push('*');
        }
    }

    function tokenize(expression) {
        const tokens = [];
        let index = 0;

        while (index < expression.length) {
            const char = expression[index];

            if (char === ' ') {
                index += 1;
                continue;
            }

            if (/\d|\./.test(char)) {
                let number = char;
                index += 1;

                while (index < expression.length && /[\d.]/.test(expression[index])) {
                    number += expression[index];
                    index += 1;
                }

                if (!isNumberToken(number)) throw new Error('Invalid number');
                addImplicitMultiplication(tokens, number);
                tokens.push(number);
                continue;
            }

            if (/[a-z]/i.test(char)) {
                let word = char;
                index += 1;

                while (index < expression.length && /[a-z]/i.test(expression[index])) {
                    word += expression[index];
                    index += 1;
                }

                if (!FUNCTIONS[word] && word !== 'pi' && word !== 'e') {
                    throw new Error('Unknown function');
                }

                addImplicitMultiplication(tokens, word);
                tokens.push(word);
                continue;
            }

            if ('+-*/^()%'.includes(char)) {
                addImplicitMultiplication(tokens, char);
                tokens.push(char);
                index += 1;
                continue;
            }

            throw new Error('Invalid character');
        }

        return tokens;
    }

    function toPostfix(tokens) {
        const output = [];
        const stack = [];
        let previous = null;

        tokens.forEach((token) => {
            if (isNumberToken(token) || token === 'pi' || token === 'e') {
                output.push(token);
            } else if (FUNCTIONS[token]) {
                stack.push(token);
            } else if (token === '(') {
                stack.push(token);
            } else if (token === ')') {
                while (stack.length && stack[stack.length - 1] !== '(') {
                    output.push(stack.pop());
                }

                if (!stack.length) throw new Error('Mismatched parentheses');
                stack.pop();

                if (FUNCTIONS[stack[stack.length - 1]]) {
                    output.push(stack.pop());
                }
            } else {
                const normalized = token === '-' && (!previous || (OPERATORS[previous] && previous !== '%') || previous === '(')
                    ? 'u-'
                    : token;
                const operator = OPERATORS[normalized];

                if (!operator) throw new Error('Invalid operator');

                while (stack.length) {
                    const top = stack[stack.length - 1];
                    const topOperator = OPERATORS[top];

                    if (!topOperator) break;

                    const shouldPop = operator.associativity === 'left'
                        ? operator.precedence <= topOperator.precedence
                        : operator.precedence < topOperator.precedence;

                    if (!shouldPop) break;
                    output.push(stack.pop());
                }

                stack.push(normalized);
            }

            previous = token;
        });

        while (stack.length) {
            const token = stack.pop();

            if (token === '(' || token === ')') throw new Error('Mismatched parentheses');
            output.push(token);
        }

        return output;
    }

    function evaluatePostfix(postfix, angleMode) {
        const stack = [];

        postfix.forEach((token) => {
            if (isNumberToken(token)) {
                stack.push(Number(token));
            } else if (token === 'pi') {
                stack.push(Math.PI);
            } else if (token === 'e') {
                stack.push(Math.E);
            } else if (FUNCTIONS[token]) {
                if (!stack.length) throw new Error('Missing function value');
                stack.push(FUNCTIONS[token](stack.pop(), angleMode));
            } else if (OPERATORS[token]) {
                const operator = OPERATORS[token];

                if (stack.length < operator.args) throw new Error('Missing operand');

                if (operator.args === 1) {
                    stack.push(operator.run(stack.pop()));
                } else {
                    const second = stack.pop();
                    const first = stack.pop();
                    stack.push(operator.run(first, second));
                }
            }
        });

        if (stack.length !== 1) throw new Error('Invalid expression');
        if (!Number.isFinite(stack[0])) throw new Error('Math error');

        return stack[0];
    }

    function formatResult(value) {
        if (!Number.isFinite(value)) return 'Error';
        if (Object.is(value, -0)) return '0';

        const rounded = Number.parseFloat(value.toPrecision(12));
        const text = String(rounded);

        return text.length > 16 ? rounded.toExponential(8) : text;
    }

    function evaluateExpression(expression, angleMode) {
        if (!expression.trim()) return 0;

        const postfix = toPostfix(tokenize(expression));
        return evaluatePostfix(postfix, angleMode);
    }

    global.CalciOperations = {
        evaluateExpression,
        formatResult
    };
})(globalThis);
