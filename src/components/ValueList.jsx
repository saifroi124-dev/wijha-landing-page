export function ValueList({ items }) {
  return (
    <ul className="value-list">
      {items.map((text, i) => (
        <li key={i}>
          <div className="bullet" />
          {text}
        </li>
      ))}
    </ul>
  );
}
