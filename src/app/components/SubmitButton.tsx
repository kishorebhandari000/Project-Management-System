import './SubmitButton.css';

interface SubmitButtonProps {
  disabled?: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({ disabled, children }: SubmitButtonProps) {
  return (
    <button type="submit" disabled={disabled} className="submit-btn">
      <span className="circle circle1" aria-hidden="true" />
      <span className="circle circle2" aria-hidden="true" />
      <span className="circle circle3" aria-hidden="true" />
      <span className="circle circle4" aria-hidden="true" />
      <span className="circle circle5" aria-hidden="true" />
      <span className="text">{children}</span>
    </button>
  );
}