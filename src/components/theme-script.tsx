export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("resonance-theme")||"auto";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";var bg=d==="dark"?"#121018":"#f6f4f8";document.documentElement.setAttribute("data-theme",d);document.documentElement.style.colorScheme=d;document.documentElement.style.backgroundColor=bg;var s=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.matchMedia("(display-mode: minimal-ui)").matches||Boolean(navigator.standalone);if(s){document.documentElement.setAttribute("data-display","standalone");}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
