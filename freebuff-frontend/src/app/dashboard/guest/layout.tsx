import GuestSidebar from "./GuestSidebar";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-ocp-background">
      <GuestSidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
