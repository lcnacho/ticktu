import { Suspense } from "react";
import { ThemeProvider } from "@/components/shared/theme-provider";

function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="buyer">
      <Suspense fallback={<>{children}</>}>
        <ThemeProvider>{children}</ThemeProvider>
      </Suspense>
    </div>
  );
}

export default BuyerLayout;
