# Proof2Buss Clipper

## 日本語

Proof2Buss Clipper は、クリップボードに入っている proof.sty 形式の LaTeX 証明木を読み取り、`\infer` および `\infer*` を `bussproofs` 形式の LaTeX 記法に変換して、変換後の文字列をクリップボードに戻す Chrome 拡張です。

この拡張は、proof.sty で書かれた推論規則を、`bussproofs` パッケージで表示できる証明木へ変換するための小さなツールです。

### 対応している入力

```latex
\infer[Rule]{Conclusion}{Premise1 & Premise2}
\infer*{Conclusion}{Premise}
\infer*[Rule]{Conclusion}{Premise1 & Premise2}
```

`\infer` および `\infer*` が入れ子になっている場合にも対応しています。

### 変換方針

- `\infer[Rule]{C}{P}` は、前提を先に出力し、その後に `\RightLabel{Rule}` と `\UnaryInfC{$C$}` を出力します。
- `\infer*[Rule]{C}{P}` は、対応する `\UnaryInfC`, `\BinaryInfC` などの直前に `\dottedLine` を挿入し、点線の推論線として扱います。
- 前提は、最上位の `&` だけで分割します。
- `bussproofs` の標準的なコマンドに合わせて、1 個から 5 個までの前提を `\UnaryInfC` から `\QuinaryInfC` で出力します。

### 変換例

入力:

```latex
\infer[ImpI]{A \to B}{\infer[Ax]{B}{A}}
```

出力:

```latex
\[
\begin{prooftree}
\AxiomC{$A$}
\RightLabel{Ax}
\UnaryInfC{$B$}
\RightLabel{ImpI}
\UnaryInfC{$A \to B$}
\end{prooftree}
\]
```

### インストール方法

1. このディレクトリを `prooftobuss-clipper` という名前で保存します。
2. Chrome を開きます。
3. `chrome://extensions/` を開きます。
4. 右上の「デベロッパーモード」をオンにします。
5. 「パッケージ化されていない拡張機能を読み込む」をクリックします。
6. `prooftobuss-clipper` ディレクトリを選択します。
7. 必要に応じて、Chrome の拡張機能メニューから「Proof2Buss Clipper」をピン留めします。

### 使い方

1. proof.sty 形式の式をクリップボードにコピーします。
2. Chrome の Proof2Buss Clipper アイコンをクリックします。
3. 「Convert clipboard」をクリックします。
4. 変換された `bussproofs` 形式の LaTeX 文字列を、必要な場所に貼り付けます。

### LaTeX 側で必要な設定

LaTeX 文書のプリアンブルに次を追加してください。

```latex
\usepackage{bussproofs}
```

### 注意

- この拡張は、クリップボード上の文字列を変換するだけです。
- LaTeX 文書全体の構文解析や、proof.sty の全機能の完全な再現を目的としたものではありません。
- 複雑なマクロ定義を含む入力では、期待通りに変換できない場合があります。

---

## English

Proof2Buss Clipper is a Chrome extension that reads a proof tree written in proof.sty-style LaTeX from the clipboard, converts `\infer` and `\infer*` expressions into `bussproofs` LaTeX notation, and writes the converted text back to the clipboard.

This extension is a small utility for converting inference rules written with proof.sty into proof trees that can be typeset with the `bussproofs` package.

### Supported input

```latex
\infer[Rule]{Conclusion}{Premise1 & Premise2}
\infer*{Conclusion}{Premise}
\infer*[Rule]{Conclusion}{Premise1 & Premise2}
```

Nested `\infer` and `\infer*` expressions are supported.

### Conversion policy

- `\infer[Rule]{C}{P}` is converted into the premise first, followed by `\RightLabel{Rule}` and `\UnaryInfC{$C$}`.
- `\infer*[Rule]{C}{P}` is treated as an inference with a dotted line by inserting `\dottedLine` before the corresponding `\UnaryInfC`, `\BinaryInfC`, and so on.
- Premises are split only at top-level `&` symbols.
- Following the standard commands provided by `bussproofs`, the converter directly supports one to five premises, using `\UnaryInfC` through `\QuinaryInfC`.

### Example

Input:

```latex
\infer[ImpI]{A \to B}{\infer[Ax]{B}{A}}
```

Output:

```latex
\[
\begin{prooftree}
\AxiomC{$A$}
\RightLabel{Ax}
\UnaryInfC{$B$}
\RightLabel{ImpI}
\UnaryInfC{$A \to B$}
\end{prooftree}
\]
```

### Installation

1. Save this directory as `prooftobuss-clipper`.
2. Open Chrome.
3. Open `chrome://extensions/`.
4. Turn on Developer mode.
5. Click "Load unpacked".
6. Select the `prooftobuss-clipper` directory.
7. Pin "Proof2Buss Clipper" from the Chrome extensions menu if desired.

### Usage

1. Copy a proof.sty expression to the clipboard.
2. Click the Proof2Buss Clipper icon in Chrome.
3. Click "Convert clipboard".
4. Paste the converted `bussproofs` LaTeX text wherever needed.

### LaTeX preamble

Add the following line to the preamble of your LaTeX document.

```latex
\usepackage{bussproofs}
```

### Notes

- This extension only converts the string currently stored in the clipboard.
- It is not intended to parse an entire LaTeX document or fully reproduce every feature of proof.sty.
- Inputs containing complex macro definitions may not be converted exactly as expected.
