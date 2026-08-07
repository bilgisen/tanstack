export function HomeFooter() {
  return (
    <footer className="px-4 md:px-6 py-10 mt-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-foreground">JetBorsa</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            BIST uzmanı yapay zekâ destekli finansal analiz platformu.
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto mt-8 pt-4 border-t border-border/30 flex items-center justify-between">
        <span className="text-[11px] text-muted-foreground/60">
          © 2026 JetBorsa. Tüm hakları saklıdır.
        </span>
      </div>
    </footer>
  )
}