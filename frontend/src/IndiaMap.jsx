import React, { useEffect, useState, useRef, useCallback } from "react";

const IndiaMap = ({ stateData }) => {
  const [svgContent, setSvgContent] = useState(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgContainerRef = useRef(null);

  // Fetch the external SVG file
  useEffect(() => {
    fetch("/india.svg")
      .then((response) => response.text())
      .then((data) => setSvgContent(data))
      .catch((error) => console.error("Error fetching SVG:", error));
  }, []);

  // Generate color based on total_amount
  const getColorFromAmount = (amount, min, max) => {
    const normalized = (amount - min) / (max - min);
    const darkBlue = [25, 25, 112]; // Dark Blue
    const lightBlue = [135, 206, 250]; // Light Sky Blue
    const r = Math.round(
      lightBlue[0] + normalized * (darkBlue[0] - lightBlue[0])
    );
    const g = Math.round(
      lightBlue[1] + normalized * (darkBlue[1] - lightBlue[1])
    );
    const b = Math.round(
      lightBlue[2] + normalized * (darkBlue[2] - lightBlue[2])
    );
    return `rgb(${r},${g},${b})`;
  };

  // Process the SVG content once it's loaded
  useEffect(() => {
    if (svgContent) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = doc.querySelector("svg");

      if (svgElement) {
        const minAmount = Math.min(
          ...stateData.map((state) => state.total_amount)
        );
        const maxAmount = Math.max(
          ...stateData.map((state) => state.total_amount)
        );

        stateData.forEach(({ state, total_amount }) => {
          const path = svgElement.querySelector(`[title="${state}"]`);
          if (path) {
            path.setAttribute(
              "fill",
              getColorFromAmount(total_amount, minAmount, maxAmount)
            );

            path.setAttribute("data-amount", total_amount);
          }
        });

        // Convert the updated SVG into a string and set as state
        const svgAsString = new XMLSerializer().serializeToString(svgElement);
        const svgContainer = svgContainerRef.current;
        svgContainer.innerHTML = svgAsString;
      }
    }
  }, [svgContent, stateData]);

  // Panning logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - translateX,
      y: e.clientY - translateY,
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;

      setTranslateX(newX);
      setTranslateY(newY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
    ref={svgContainerRef}
    style={{
      width: "100%",
      height: "100%",
      overflow: "hidden",
      position: "relative",
      cursor: isDragging ? "grabbing" : "grab",
      transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
      transformOrigin: "0 0",
      transition: isDragging ? "none" : "transform 0.1s ease-out", // Transition for smoother release after drag
    }}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
  </div>

  );
};

export default IndiaMap;
