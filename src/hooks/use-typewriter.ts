import { useState, useEffect, useRef } from "react";

export function useTypewriter(words: string[], speed = 100, pause = 2000, trigger = true) {
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!trigger || words.length === 0) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setText(words[0]); return; }

    const handleType = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setText((current) =>
        isDeleting ? fullText.substring(0, current.length - 1) : fullText.substring(0, current.length + 1)
      );

      let typeSpeed = speed;
      if (isDeleting) typeSpeed /= 2;

      if (!isDeleting && text === fullText) {
        typeSpeed = pause;
        setIsDeleting(true);
      } else if (isDeleting && text === "") {
        setIsDeleting(false);
        setLoopNum((num) => num + 1);
        typeSpeed = speed;
      }

      timer.current = setTimeout(handleType, typeSpeed);
    };

    timer.current = setTimeout(handleType, speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [text, isDeleting, loopNum, words, speed, pause, trigger]);

  return text;
}
