(() => {
    const fractionPattern = /(?<![\p{L}\p{N}])([\p{L}\d]+)\s*\/\s*([\p{L}\d]+)(?![\p{L}\p{N}])/gu;
    const excludedTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'NOSCRIPT']);

    function renderizarFracoes(container) {
        if (!container) return;
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
            acceptNode(node) {
                const parent = node.parentElement;
                if (!node.nodeValue.includes('/') || !parent || excludedTags.has(parent.tagName) || parent.closest('.fracoes-vertical')) {
                    return NodeFilter.FILTER_REJECT;
                }
                fractionPattern.lastIndex = 0;
                const hasFraction = fractionPattern.test(node.nodeValue);
                fractionPattern.lastIndex = 0;
                return hasFraction ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
            }
        });
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);

        nodes.forEach((node) => {
            const text = node.nodeValue;
            fractionPattern.lastIndex = 0;
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            let match;
            while ((match = fractionPattern.exec(text))) {
                fragment.append(document.createTextNode(text.slice(lastIndex, match.index)));
                const fraction = document.createElement('span');
                fraction.className = 'fracoes-vertical';
                fraction.setAttribute('role', 'math');
                fraction.setAttribute('aria-label', `${match[1]} sobre ${match[2]}`);
                const numerator = document.createElement('span');
                numerator.className = 'fracao-numerador';
                numerator.textContent = match[1];
                const denominator = document.createElement('span');
                denominator.className = 'fracao-denominador';
                denominator.textContent = match[2];
                fraction.append(numerator, denominator);
                fragment.append(fraction);
                lastIndex = match.index + match[0].length;
            }
            fragment.append(document.createTextNode(text.slice(lastIndex)));
            node.replaceWith(fragment);
        });
    }

    const style = document.createElement('style');
    style.textContent = `
        .fracoes-vertical { display:inline-grid; grid-template-rows:auto auto; vertical-align:middle; text-align:center; line-height:1.05; font-size:.82em; margin:0 .12em; min-width:1.05em; white-space:nowrap; }
        .fracao-numerador { padding:0 .16em .1em; }
        .fracao-denominador { border-top:1.5px solid currentColor; padding:.1em .16em 0; }
        .fraction-demo { display:inline-grid; grid-template-rows:auto auto; vertical-align:middle; text-align:center; line-height:1.05; font-size:.78em; min-width:1.15em; }
        .fraction-demo > span:last-child { border-top:2px solid currentColor; padding-top:.1em; }
        .welcome-enter { animation: welcome-enter .7s cubic-bezier(.2,.75,.25,1) both; }
        .welcome-delay-1 { animation-delay:.12s; }
        .welcome-delay-2 { animation-delay:.22s; }
        @keyframes welcome-enter { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .welcome-enter { animation:none; } }
    `;
    document.head.append(style);
    window.renderizarFracoes = renderizarFracoes;
})();
