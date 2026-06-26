const waves = {
  amber: "fill-[#3D2314]",
  cream: "fill-[#FFF8F0]",
  dark: "fill-[#2C1A0E]",
}

export default function WaveDivider({ bottom, top }) {
  const topFill = waves[top] || "fill-[#FFF8F0]"
  const bottomFill = waves[bottom] || "fill-[#2C1A0E]"
  return (
    <div className="relative leading-[0] -mb-1">
      <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className="w-full h-[50px] md:h-[80px]">
        <path
          className={topFill}
          d="M0,40 C360,100 1080,0 1440,40 L1440,0 L0,0 Z"
        />
        <path
          className={bottomFill}
          d="M0,60 C360,0 1080,100 1440,60 L1440,100 L0,100 Z"
        />
      </svg>
    </div>
  )
}
