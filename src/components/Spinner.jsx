/**
 * Indicador de carga circular.
 * Se apoya en la utilidad `animate-spin` de Tailwind.
 */
export default function Spinner() {
  return (
    <div
      className="w-10 h-10 border-4 border-primary border-t-transparent
                 rounded-full animate-spin"
    />
  );
}
