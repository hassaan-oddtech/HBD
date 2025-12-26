// src/BirthdayCard.jsx
import React, { useEffect, useRef, useState } from "react";
import "./BirthdayCard.css"; // We will create this next
import { Tree } from "../helpers/treeLibrary"; // The file we created above

// --- Configuration ---
const treeOptions = {
  bloom: { num: 700, width: 1080, height: 650 },
  footer: { width: 1200, height: 5, speed: 10 },
};

// Branch data
const branchData = [
  [535, 680, 570, 250, 500, 200, 30, 100, [
    [540, 500, 455, 417, 340, 400, 13, 100, [
      [450, 435, 434, 430, 394, 395, 2, 40]
    ]],
    [550, 445, 600, 356, 680, 345, 12, 100, [
      [578, 400, 648, 409, 661, 426, 3, 80]
    ]],
    [539, 281, 537, 248, 534, 217, 3, 40],
    [546, 397, 413, 247, 328, 244, 9, 80, [
      [427, 286, 383, 253, 371, 205, 2, 40],
      [498, 345, 435, 315, 395, 330, 4, 60]
    ]],
    [546, 357, 608, 252, 678, 221, 6, 100, [
      [590, 293, 646, 277, 648, 271, 2, 80]
    ]]
  ]]
];

// Helper to simulate sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function BirthdayCard() {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const textRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [showText, setShowText] = useState(false);
  const [timeText, setTimeText] = useState("");
  const [scale, setScale] = useState(1); // State for responsiveness
  
  
  // --- 1. Responsive Scaling Logic ---
  useEffect(() => {
    const handleResize = () => {
      // Logic: Compare screen size to our fixed canvas size (1100x680)
      const targetWidth = 1100;
      const targetHeight = 680;
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const scaleX = screenWidth / targetWidth;
      const scaleY = screenHeight / targetHeight;

      const newScale = Math.min(scaleX, scaleY, 1) * 0.90; 
      setScale(newScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Run once on load

    return () => window.removeEventListener("resize", handleResize);
  }, []);

 // --- 2. Timer Effect ---
  useEffect(() => {
    const startDate = new Date("2023-01-01T00:00:00"); 
    const interval = setInterval(() => {
      const current = new Date();
      const seconds = Math.floor((current - startDate) / 1000);
      const days = Math.floor(seconds / (3600 * 24));
      const hours = Math.floor((seconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      setTimeText(`${days} Days ${hours} Hours ${minutes} Minutes ${secs} Seconds`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Hardcode dimensions for logic (rendering is scaled via CSS)
    const width = 1100;
    const height = 680;
    canvas.width = width;
    canvas.height = height;

    const opts = {
      ...treeOptions,
      seed: { x: width / 2 - 20, color: "rgb(190, 26, 37)", scale: 2 },
      branch: branchData,
    };

    const tree = new Tree(canvas, width, height, opts);
    canvasRef.current.__tree = tree;

    // Initial draw loop
    const seed = tree.seed;
    const interval = setInterval(() => {
        if(!started) seed.draw();
    }, 50);

    return () => clearInterval(interval);
  }, [started]);
  
  const handleStart = async (e) => {
    if (started) return;
    if (e && e.cancelable) e.preventDefault();
    setStarted(true);

    if (audioRef.current) {
      audioRef.current.play().catch((e) => console.log("Audio needed interaction"));
    }

    const canvas = canvasRef.current;
    const tree = canvas.__tree;
    const seed = tree.seed;
    const foot = tree.footer;

    while (seed.canScale()) {
      seed.scale(0.95);
      await sleep(10);
    }
    while (seed.canMove()) {
      seed.move(0, 2);
      foot.draw();
      await sleep(10);
    }
    do {
      tree.grow();
      await sleep(10);
    } while (tree.canGrow());
    do {
      tree.flower(2);
      await sleep(10);
    } while (tree.canFlower());

    tree.snapshot("p1", 240, 0, 610, 680);
    while (tree.move("p1", 500, 0)) {
      foot.draw();
      await sleep(10);
    }
    foot.draw();
    tree.snapshot("p2", 500, 0, 610, 680);

    setShowText(true);
  };
  
  // Typewriter Effect for the text
  useEffect(() => {
    if (showText && textRef.current) {
      const str = textRef.current.getAttribute("data-text"); // Use attribute for cleaner React
      textRef.current.innerHTML = "";
      textRef.current.style.display = "block";
      let progress = 0;
      
      const timer = setInterval(() => {
        const current = str.substr(progress, 1);
        if (current === "<") {
          progress = str.indexOf(">", progress) + 1;
        } else {
          progress++;
        }
        textRef.current.innerHTML = str.substring(0, progress) + (progress & 1 ? "_" : "");
        if (progress >= str.length) clearInterval(timer);
      }, 75);
      return () => clearInterval(timer);
    }
  }, [showText]);
  
  const messageHtml = `
    <span class="say">To My Wifey 💞💞💞💞💞</span><br>
    <span class="say">Hey Madam g 💞</span><br>
    <span class="say">Love you ❤️❤️❤️</span><br>
    <span class="say">Happy Birthday 🎈</span><br>
    <span class="say">May God bless you 🍀</span><br>
    <span class="say">And give u many happiness 💕</span><br>
    <span class="say">Hope u have a great Year ❤️😘</span><br>
    <span class="say">To you, my love and my soon to be Wifey ❤️</span><br>
  `;

  return (
    <div className="birthday-container">
      <audio ref={audioRef} loop>
        <source src="/aud.mp3" type="audio/mp3" />
      </audio>

      <div id="main">
        <div 
          id="wrap" 
          style={{ transform: `scale(${scale})` }}
        >
          <div id="text">
            <div id="code" 
            ref={textRef}
            data-text={messageHtml}
             style={{ display: showText ? "block" : "none" }}>
              {/* {Words.map((word, index) => (
                <>
                <span className="say" key={index}>{word}</span><br />
                </>
              ))} */}
            </div>
          </div>
          
          <div id="clock-box" style={{ display: showText ? "block" : "none" }}>
             <span id="clock">{timeText}</span>
          </div> 

          <canvas 
            id="canvas" 
            ref={canvasRef} 
            className={!started ? "hand" : ""}
            onClick={handleStart}
          ></canvas>
        </div>
      </div>
    </div>
  );
}