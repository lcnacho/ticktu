import { ThemeProvider } from "@/components/shared/theme-provider";

async function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-surface="buyer">
      <ThemeProvider>{children}</ThemeProvider>
    </div>
  );
}

export default BuyerLayout;
