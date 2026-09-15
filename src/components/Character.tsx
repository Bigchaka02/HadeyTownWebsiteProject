import sheet from "../assets/character.png";
import { FRAME, type Walker } from "../walker";

// The character's sprite; the walker moves it and picks the frame.
export default function Character({ walker }: { walker: Walker }) {
  return (
    <div
      ref={walker.attach}
      className="character"
      style={{ width: FRAME.w, height: FRAME.h, backgroundImage: `url(${sheet})` }}
      aria-hidden
    />
  );
}
