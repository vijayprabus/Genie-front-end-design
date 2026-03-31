export default function GenieLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2C7.1 2 1.5 7 1.5 13.2C1.5 19.4 7.1 24.4 14 24.4C15.1 24.4 16.16 24.26 17.16 24L21 27L20.2 22.6C24.04 20.46 26.5 17.1 26.5 13.2C26.5 7 20.9 2 14 2Z"
        fill="#7C3AED"
      />
    </svg>
  );
}
