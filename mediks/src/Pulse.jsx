export default function Pulse({ active }) {
  return (
    <svg className={"pulse" + (active ? " active" : "")} viewBox="0 0 240 40" aria-hidden="true">
      <path className="base" d="M0 20 H70 L78 20 L84 6 L92 34 L98 14 L102 20 H240" pathLength="100" />
      <path className="beat" d="M0 20 H70 L78 20 L84 6 L92 34 L98 14 L102 20 H240" pathLength="100" />
    </svg>
  );
}
