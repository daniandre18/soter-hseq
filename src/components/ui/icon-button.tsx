import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      tone: {
        // Ícono "principal": texto y hover más marcados (ej. abrir menú).
        default: "text-gray-500 hover:text-gray-800 hover:bg-gray-100",
        // Ícono secundario/decorativo: arranca más apagado (ej. notificaciones, cerrar).
        muted: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
      },
      size: {
        sm: "p-1 rounded",
        md: "p-1.5 rounded-lg",
        lg: "p-2 rounded-lg",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "lg",
    },
  }
);

/**
 * `aria-label` es obligatorio: un IconButton sin texto visible que no lo
 * declare es, por definición, un botón mudo para lectores de pantalla. Se
 * fuerza en el tipo para que sea un error de compilación, no un hallazgo de
 * code review.
 */
type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> &
  VariantProps<typeof iconButtonVariants> & {
    "aria-label": string;
  };

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, tone, size, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(iconButtonVariants({ tone, size }), className)}
      {...props}
    />
  )
);

IconButton.displayName = "IconButton";
