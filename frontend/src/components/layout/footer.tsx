export function Footer() {
  return (
    <footer className="border-t mt-12">
      <div className="container py-8 text-sm text-muted flex items-center justify-between">
        <p>© {new Date().getFullYear()} Pediafor. All rights reserved.</p>
        <nav className="flex gap-4">
          <a href="/privacy" className="hover:underline">Privacy</a>
          <a href="/terms" className="hover:underline">Terms</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </nav>
      </div>
    </footer>
  );
}
