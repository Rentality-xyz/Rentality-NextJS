import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import arrowLeft from "../../images/arrows/rntArrowLeft.svg";
import arrowRight from "../../images/arrows/rntArrowRight.svg";
import Image from "next/image";

type ScrollingHorizontallyProps = {
  className?: string | undefined;
  children?: React.ReactNode;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
};

export default function ScrollingHorizontally({ children, className, onScroll }: ScrollingHorizontallyProps) {
  const wrapperClassName = cn("relative", className);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Показываем/скрываем стрелки в зависимости от позиции прокрутки
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);

      // Вызываем пользовательскую функцию onScroll, если она передана
      if (onScroll) {
        onScroll(event);
      }
    }
  };

  const scrollByAmount = (amount: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
    }
  };

  const updateArrowsVisibility = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Показываем/скрываем стрелки в зависимости от позиции прокрутки
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollWidth > clientWidth && scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    updateArrowsVisibility();
    window.addEventListener("resize", updateArrowsVisibility);

    return () => {
      window.removeEventListener("resize", updateArrowsVisibility);
    };
  }, []);

  return (
    <div className={wrapperClassName}>
      {/* Левая стрелка */}
      {showLeftArrow && (
        <button
          onClick={() => scrollByAmount(-200)} // Прокрутка влево
          className="absolute left-0 top-1/2 z-10 w-10 -translate-y-1/2"
        >
          <Image src={arrowLeft} alt="" />
        </button>
      )}

      {/* Правая стрелка */}
      {showRightArrow && (
        <button
          onClick={() => scrollByAmount(200)} // Прокрутка вправо
          className="absolute right-0 top-1/2 z-10 w-10 -translate-y-1/2"
        >
          <Image src={arrowRight} alt="" />
        </button>
      )}

      {/* Прокручиваемый контейнер */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-none flex items-center gap-4 overflow-x-auto"
        style={{ scrollBehavior: "smooth" }}
      >
        {children}
      </div>
    </div>
  );
}
