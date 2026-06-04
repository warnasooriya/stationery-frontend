export default function Card({ children, className = '' }) {
  return <div className={`card card-pad ${className}`}>{children}</div>;
}
