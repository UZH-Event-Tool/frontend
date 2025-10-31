export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-16 text-gray-900">
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}
