import { space, radius, color } from "../theme/tokens";

type Props = {
  label: string;
  variant?: "primary" | "ghost";
  onClick?: () => void;
};

// Componente reutilizável. Antes de criar um novo botão, ESTENDER este via variant.
export function Button({ label, variant = "primary", onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: `${space.sm}px ${space.md}px`,
        borderRadius: radius.md,
        background: variant === "primary" ? color.accent : "transparent",
        color: color.text,
        border: "none",
      }}
    >
      {label}
    </button>
  );
}
