"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@mui/material";
import { theme } from "@/app/theme/theme";

export function Providers({ children }: { children: ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
