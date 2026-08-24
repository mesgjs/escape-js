import { assertEquals } from "jsr:@std/assert";
import {
  escapeJSString,
  unescapeJSString,
  escapeCSHT,
  unescapeCSHT,
} from "../src/escape.esm.js";

Deno.test("escapeJSString - basic and control characters", () => {
  assertEquals(escapeJSString(""), "");
  assertEquals(escapeJSString("hello world"), "hello world");
  assertEquals(escapeJSString("\b"), "\\b");
  assertEquals(escapeJSString("\n"), "\\n");
  assertEquals(escapeJSString("\r"), "\\r");
  assertEquals(escapeJSString("\t"), "\\t");
  assertEquals(escapeJSString("\\"), "\\\\");
});

Deno.test("escapeJSString - quotes and options", () => {
  // Default options (both sq and dq true)
  assertEquals(escapeJSString("'"), "\\'");
  assertEquals(escapeJSString('"'), '\\"');

  // sq false, dq true
  assertEquals(escapeJSString("'", { sq: false }), "'");
  assertEquals(escapeJSString('"', { sq: false }), '\\"');

  // sq true, dq false
  assertEquals(escapeJSString("'", { dq: false }), "\\'");
  assertEquals(escapeJSString('"', { dq: false }), '"');

  // sq false, dq false
  assertEquals(escapeJSString("'", { sq: false, dq: false }), "'");
  assertEquals(escapeJSString('"', { sq: false, dq: false }), '"');
});

Deno.test("escapeJSString - hex and unicode escapes", () => {
  // cc < 0x10
  assertEquals(escapeJSString("\x05"), "\\x05");
  
  // cc < 0x100
  assertEquals(escapeJSString("\x7f"), "\\x7f");
  assertEquals(escapeJSString("\x80"), "\\x80");

  // cc < 0x1000
  assertEquals(escapeJSString("\u0100"), "\\u0100");

  // cc >= 0x1000
  assertEquals(escapeJSString("\u1234"), "\\u1234");

  // Surrogate pairs (outside BMP)
  // "𠮷" is U+20BB7, represented as \ud842\udfb7
  assertEquals(escapeJSString("𠮷"), "\\ud842\\udfb7");
});

Deno.test("unescapeJSString - basic and control characters", () => {
  assertEquals(unescapeJSString(""), "");
  assertEquals(unescapeJSString("hello world"), "hello world");
  assertEquals(unescapeJSString("\\b"), "\b");
  assertEquals(unescapeJSString("\\n"), "\n");
  assertEquals(unescapeJSString("\\r"), "\r");
  assertEquals(unescapeJSString("\\t"), "\t");
  assertEquals(unescapeJSString("\\'"), "'");
  assertEquals(unescapeJSString('\\"'), '"');
  assertEquals(unescapeJSString("\\\\"), "\\");
});

Deno.test("unescapeJSString - hex and unicode escapes", () => {
  // Hex escapes
  assertEquals(unescapeJSString("\\x0a"), "\n");
  assertEquals(unescapeJSString("\\x7F"), "\x7f");

  // Unicode 4-digit hex escapes
  assertEquals(unescapeJSString("\\u1234"), "\u1234");

  // Unicode code point hex escapes
  assertEquals(unescapeJSString("\\u{1f600}"), "😀");

  // Unicode code point decimal escapes (0d or 0D prefix)
  assertEquals(unescapeJSString("\\u{0d128512}"), "😀");
  assertEquals(unescapeJSString("\\u{0D128512}"), "😀");
});

Deno.test("escapeCSHT - script tags", () => {
  assertEquals(escapeCSHT("</script>"), "<\\/script>");
  assertEquals(escapeCSHT("<script>"), "<script>");
  assertEquals(escapeCSHT("</SCRIPT>"), "<\\/SCRIPT>");
  assertEquals(escapeCSHT("<\\/script>"), "<\\\\/script>");
  assertEquals(escapeCSHT("<\\\\/script>"), "<\\\\\\/script>");
  assertEquals(escapeCSHT("foo </script> bar"), "foo <\\/script> bar");
});

Deno.test("unescapeCSHT - script tags", () => {
  assertEquals(unescapeCSHT("<\\/script>"), "</script>");
  assertEquals(unescapeCSHT("<\\\\/script>"), "<\\/script>");
  assertEquals(unescapeCSHT("<\\\\\\/script>"), "<\\\\/script>");
  assertEquals(unescapeCSHT("<\\/SCRIPT>"), "</SCRIPT>");
  assertEquals(unescapeCSHT("foo <\\/script> bar"), "foo </script> bar");
});
