import { useEffect, useState } from "react";

export function useExamSecurity(isActive: boolean, onViolation: (type: string) => void) {
  const [warnings, setWarnings] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        onViolation("tab_switch");
        setWarnings(prev => prev + 1);
      }
    };

    const handleBlur = () => {
      onViolation("window_blur");
      setWarnings(prev => prev + 1);
    };

    // Prevent Copy/Paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      onViolation("copy_attempt");
      alert("Copying is disabled during the exam!");
    };
    
    // Check Fullscreen (Basic)
    const checkFullscreen = () => {
       if (!document.fullscreenElement) {
         // Optionally force it or warn
         // onViolation("fullscreen_exit"); 
       }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", (e) => e.preventDefault()); // Disable right click

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", (e) => e.preventDefault());
    };
  }, [isActive, onViolation]);

  return { warnings };
}
