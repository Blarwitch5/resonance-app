export function ThemeScript() {
  const script = `(function(){try{var t=localStorage.getItem("resonance-theme")||"auto";var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches)?"dark":"light";var bg=d==="dark"?"#121018":"#f6f4f8";var fg=d==="dark"?"#f5f3f8":"#14101c";document.documentElement.setAttribute("data-theme",d);document.documentElement.style.colorScheme=d;document.documentElement.style.backgroundColor=bg;document.documentElement.style.setProperty("--rs-background",bg);document.documentElement.style.setProperty("--rs-text",fg);if(document.body){document.body.style.backgroundColor=bg;}var s=window.matchMedia("(display-mode: standalone)").matches||window.matchMedia("(display-mode: fullscreen)").matches||window.matchMedia("(display-mode: minimal-ui)").matches||Boolean(navigator.standalone);if(s){document.documentElement.setAttribute("data-display","standalone");}}catch(e){}})();`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "html,body{background:#f6f4f8;color:#14101c}html[data-theme=dark],html[data-theme=dark] body{background:#121018;color:#f5f3f8}",
        }}
      />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
