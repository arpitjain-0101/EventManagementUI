import "./SuccessToast.css";

interface SuccessToastProps {
  message: string;
}

export default function SuccessToast({ message }: SuccessToastProps) {
  if (!message) return null;

  return (
    <div className="success-toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
