const button = document.getElementById("convert");
const statusBox = document.getElementById("status");
const wrapBox = document.getElementById("wrap");
const mathBox = document.getElementById("math");

function setStatus(text) {
  statusBox.textContent = text;
}

button.addEventListener("click", async () => {
  try {
    setStatus("Reading clipboard...");
    const input = await navigator.clipboard.readText();
    if (!input.trim()) {
      setStatus("Clipboard is empty.");
      return;
    }

    const output = Proof2Buss.convertProofStyToBussproofs(input, {
      wrapProoftree: wrapBox.checked,
      wrapDisplayMath: mathBox.checked
    });

    await navigator.clipboard.writeText(output);
    setStatus("Converted and copied back to clipboard.\n\nPreview:\n" + output.slice(0, 900));
  } catch (error) {
    setStatus("Conversion failed:\n" + String(error && error.message ? error.message : error));
  }
});
