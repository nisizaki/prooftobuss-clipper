/*
 * Proof2Buss Clipper
 * Converts a practical subset of proof.sty notation:
 *   \infer[Rule]{Conclusion}{Premise1 & Premise2}
 * The optional label in \infer[Label] is treated as math content.
 *   \infer*{Conclusion}{Premise}
 *   \infer*[Rule]{Conclusion}{Premise1 & Premise2}
 * Nested \infer and \infer* expressions are supported.
 */
(function (global) {
  "use strict";

  class Parser {
    constructor(text) {
      this.text = text;
      this.i = 0;
    }

    eof() {
      return this.i >= this.text.length;
    }

    startsWith(s) {
      return this.text.startsWith(s, this.i);
    }

    peek() {
      return this.text[this.i];
    }

    skipSpaces() {
      while (!this.eof() && /\s/.test(this.peek())) this.i++;
    }

    parseTop() {
      this.skipSpaces();
      const node = this.parseNodeUntil(new Set());
      this.skipSpaces();
      if (!this.eof()) {
        throw new Error("Unexpected trailing text at position " + this.i);
      }
      return node;
    }

    parseNodeUntil(stoppers) {
      const parts = [];
      let buf = "";

      while (!this.eof()) {
        const ch = this.peek();
        if (stoppers.has(ch)) break;

        if (this.startsWith("\\infer")) {
          if (buf) {
            parts.push({ type: "text", value: buf });
            buf = "";
          }
          parts.push(this.parseInfer());
          continue;
        }

        if (ch === "{") {
          buf += this.readBalancedRaw("{", "}");
          continue;
        }

        if (ch === "[") {
          buf += this.readBalancedRaw("[", "]");
          continue;
        }

        buf += ch;
        this.i++;
      }

      if (buf) parts.push({ type: "text", value: buf });
      if (parts.length === 1) return parts[0];
      return { type: "seq", parts };
    }

    parseInfer() {
      this.expect("\\infer");
      const starred = this.consume("*");
      this.skipSpaces();

      let label = "";
      if (this.peek() === "[") {
        label = this.readBalancedContent("[", "]").trim();
        this.skipSpaces();
      }

      const conclusion = this.parseRequiredGroup("conclusion");
      this.skipSpaces();
      const premisesGroup = this.parseRequiredGroup("premises");
      const premises = splitPremises(premisesGroup);

      return {
        type: "infer",
        starred,
        label,
        conclusion,
        premises
      };
    }

    parseRequiredGroup(name) {
      if (this.peek() !== "{") {
        throw new Error("Expected {" + name + "} at position " + this.i);
      }
      this.i++;
      const node = this.parseNodeUntil(new Set(["}"]));
      if (this.peek() !== "}") {
        throw new Error("Unclosed {" + name + "} before position " + this.i);
      }
      this.i++;
      return node;
    }

    readBalancedRaw(open, close) {
      const start = this.i;
      this.readBalancedContent(open, close);
      return this.text.slice(start, this.i);
    }

    readBalancedContent(open, close) {
      if (this.peek() !== open) throw new Error("Expected " + open + " at position " + this.i);
      this.i++;
      const start = this.i;
      let depth = 1;

      while (!this.eof()) {
        const ch = this.peek();
        if (ch === "\\") {
          this.i += 2;
          continue;
        }
        if (ch === open) depth++;
        if (ch === close) depth--;
        if (depth === 0) {
          const value = this.text.slice(start, this.i);
          this.i++;
          return value;
        }
        this.i++;
      }
      throw new Error("Unclosed " + open + " at position " + start);
    }

    expect(s) {
      if (!this.startsWith(s)) throw new Error("Expected " + s + " at position " + this.i);
      this.i += s.length;
    }

    consume(s) {
      if (this.startsWith(s)) {
        this.i += s.length;
        return true;
      }
      return false;
    }
  }

  function splitPremises(node) {
    const raw = renderProofSty(node);
    const chunks = [];
    let start = 0;
    let brace = 0;
    let bracket = 0;
    let paren = 0;

    for (let i = 0; i < raw.length; i++) {
      const ch = raw[i];
      if (ch === "\\") {
        i++;
        continue;
      }
      if (ch === "{") brace++;
      else if (ch === "}") brace--;
      else if (ch === "[") bracket++;
      else if (ch === "]") bracket--;
      else if (ch === "(") paren++;
      else if (ch === ")") paren--;
      else if (ch === "&" && brace === 0 && bracket === 0 && paren === 0) {
        chunks.push(raw.slice(start, i).trim());
        start = i + 1;
      }
    }
    const last = raw.slice(start).trim();
    if (last) chunks.push(last);

    return chunks.map(chunk => new Parser(chunk).parseTop());
  }

  function renderProofSty(node) {
    if (!node) return "";
    if (node.type === "text") return node.value;
    if (node.type === "seq") return node.parts.map(renderProofSty).join("");
    if (node.type === "infer") {
      const star = node.starred ? "*" : "";
      const label = node.label ? `[${node.label}]` : "";
      return `\\infer${star}${label}{${renderProofSty(node.conclusion)}}{${node.premises.map(renderProofSty).join(" & ")}}`;
    }
    return "";
  }

  function renderMath(node) {
    return renderProofSty(node).trim();
  }

  function renderBuss(node, lines) {
    if (node.type === "infer") return renderInfer(node, lines);

    const text = renderMath(node);
    if (text) lines.push(`\\AxiomC{$${text}$}`);
  }

  function renderInfer(node, lines) {
    for (const premise of node.premises) renderBuss(premise, lines);

    if (node.label) lines.push(`\\RightLabel{$${node.label}$}`);
    if (node.starred) lines.push("\\dottedLine");

    const n = node.premises.length;
    const conclusion = renderMath(node.conclusion);
    const cmd = infCommand(n);
    lines.push(`${cmd}{$${conclusion}$}`);
  }

  function infCommand(n) {
    switch (n) {
      case 0: return "\\AxiomC";
      case 1: return "\\UnaryInfC";
      case 2: return "\\BinaryInfC";
      case 3: return "\\TrinaryInfC";
      case 4: return "\\QuaternaryInfC";
      case 5: return "\\QuinaryInfC";
      default:
        throw new Error("bussproofs directly supports up to five premises; found " + n + ". Split the rule or define a custom macro.");
    }
  }

  function stripDisplayMath(s) {
    let text = s.trim();
    if (text.startsWith("\\[") && text.endsWith("\\]")) {
      text = text.slice(2, -2).trim();
    }
    if (text.startsWith("$$") && text.endsWith("$$")) {
      text = text.slice(2, -2).trim();
    }
    return text;
  }

  function removeOuterProoftree(s) {
    let text = s.trim();
    const begin = "\\begin{prooftree}";
    const end = "\\end{prooftree}";
    if (text.startsWith(begin) && text.endsWith(end)) {
      text = text.slice(begin.length, -end.length).trim();
    }
    return text;
  }

  function convertProofStyToBussproofs(input, options = {}) {
    const wrapProoftree = options.wrapProoftree !== false;
    const wrapDisplayMath = options.wrapDisplayMath !== false;
    const source = removeOuterProoftree(stripDisplayMath(input));
    const tree = new Parser(source).parseTop();
    const lines = [];
    renderBuss(tree, lines);

    let output = lines.join("\n");
    if (wrapProoftree) {
      output = "\\begin{prooftree}\n" + output + "\n\\end{prooftree}";
    }
    if (wrapDisplayMath) {
      output = "\\[\n" + output + "\n\\]";
    }
    return output;
  }

  global.Proof2Buss = { convertProofStyToBussproofs };
})(globalThis);
