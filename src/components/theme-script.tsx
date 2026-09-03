export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("resonance-theme")||"auto";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";document.documentElement.setAttribute("data-theme",d);var s=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.matchMedia("(display-mode: minimal-ui)").matches||Boolean(navigator.standalone);if(s){document.documentElement.setAttribute("data-display","standalone");}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
