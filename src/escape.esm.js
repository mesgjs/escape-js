/*
 * Functions for string (un)escaping
 * Author: Brian Katzung <briank@kappacs.com>
 */

// Generate string escapes for JavaScript
export function escapeJSString (s, { sq = true, dq = true } = {}) {
	// deno-lint-ignore no-control-regex
	return s.replace(/[\x00-\x1f'"\\\x7f-\uffff]/g, c => {
		switch (c) {
		case '\b': return '\\b';
		case '\n': return '\\n';
		case '\r': return '\\r';
		case '\t': return '\\t';
		case "'": return (sq ? "\\'" : "'");
		case '"': return (dq ? '\\"' : '"');
		case '\\': return '\\\\';
		}
		const cc = c.charCodeAt(), ccs = cc.toString(16);
		if (cc < 0x10) return '\\x0' + ccs;
		if (cc < 0x100) return '\\x' + ccs;
		if (cc < 0x1000) return '\\u0' + ccs;
		return '\\u' + ccs;
	});
}

// Convert an escapped (input) string into a raw (internal) string
export function unescapeJSString (input) {
	return input.replace(/\\[\\bnrt'"]|\\x[\da-fA-F]{2}|\\u\{0[dD]\d+\}|\\u\{[0-9a-fA-F]+\}|\\u[\da-fA-F]{4}/g, e => {
		switch (e[1]) {
		case '\\': case "'": case '"':
		case 'b': case 'n': case 'r': case 't':
			return (({
				'\\': '\\', "'": "'", '"': '"',
				b: '\b', n: '\n', r: '\r', t: '\t'
			})[e[1]]);
		case 'x': case 'u':
			if (e[2] === '{') {
				if (e[3] === '0' && (e[4] === 'd' || e[4] === 'D')) {
					return String.fromCodePoint(parseInt(e.slice(5, -1), 10));
				}
				return String.fromCodePoint(parseInt(e.slice(3, -1), 16));
			}
			return String.fromCharCode(parseInt(e.substring(2), 16));
		}
	});
}

// Escape </script> HTML tags
export function escapeCSHT (str) {
	return str.replace(/<(?=\\*\/script)/gi, '<\\');
}

// Unescape </script> HTML tags
export function unescapeCSHT (str) {
	return str.replace(/<\\(?=\\*\/script)/gi, '<');
}

// END
