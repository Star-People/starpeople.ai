document.getElementById('copyPrompt').addEventListener('click', async () => {
 const text = document.getElementById('setupPrompt').textContent;
 const status = document.getElementById('copyStatus');
 try {
  if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
  else {
   const field = document.createElement('textarea'); field.value = text;
   field.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(field); field.select();
   const copied = document.execCommand('copy'); field.remove(); if (!copied) throw new Error('Copy unavailable');
  }
  status.textContent = 'Copied. Paste it into Codex on your station Mac.';
 } catch {
  const range = document.createRange(); range.selectNodeContents(document.getElementById('setupPrompt'));
  const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
  status.textContent = 'Prompt selected. Copy it, then paste it into Codex.';
 }
});