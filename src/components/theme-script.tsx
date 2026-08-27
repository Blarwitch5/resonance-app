export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("resonance-theme")||"auto";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";document.documentElement.setAttribute("data-theme",d);}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
