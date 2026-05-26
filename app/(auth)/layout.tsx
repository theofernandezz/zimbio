export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      {/* Subtle gradient blob — matches Figma's decorative background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-[400px] h-[400px] rounded-full bg-accent/60 blur-3xl" />
      </div>

      {/* Logo */}
      <div className="mb-8 z-10">
        <span className="text-2xl font-bold tracking-tight text-primary">
          Zimbio
        </span>
      </div>

      <div className="w-full max-w-md z-10">{children}</div>
    </div>
  );
}
