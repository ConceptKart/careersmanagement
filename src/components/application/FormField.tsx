type Props = {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function FormField({ label, htmlFor, required, hint, error, children }: Props) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {required && <span className="required"> *</span>}
        {hint && (
          <span className="text-muted-foreground" style={{ fontWeight: "normal" }}>
            {" "}
            {hint}
          </span>
        )}
      </label>
      {children}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
