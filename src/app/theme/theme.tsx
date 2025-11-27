import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  direction: "rtl",

  palette: {
    primary: {
      main: "#067c80",
    },
    secondary: {
      main: "#688a8a",
    },
    background: {
      default: "#f4f6f8",
    },
    text: {
      primary: "#1a1a1a",
    },
  },

  typography: {
    fontFamily: "var(--font-main), system-ui, Arial, sans-serif",
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
          padding: "10px 22px",
          transition: "all 0.3s ease",
          textTransform: "none",
        },
      },
      variants: [
        {
          props: { variant: "contained" },
          style: {
            background: "var(--bg-linear)",
            color: "#ffffff",
            boxShadow: "0 6px 16px rgba(6, 124, 128, 0.35)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 10px 22px rgba(6, 124, 128, 0.45)",
              background: "var(--bg-linear)",
            },
          },
        },
        {
          props: { variant: "outlined", color: "primary" },
          style: {
            backgroundColor: "var(--bg-light)",
            color: "var(--primary-color)",
            border: "1px solid #99f6e4",
            borderRadius: 10,
            padding: "14px 26px",
            fontSize: "1rem",
            fontWeight: 700,
            minWidth: "160px",
            boxShadow: "0 8px 20px -8px rgba(13, 148, 136, 0.4)",
            "&:hover": {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 24px -10px rgba(13, 148, 136, 0.5)",
              backgroundColor: "var(--bg-light)",
            },
          },
        },
      ],
    },

    MuiAppBar: {
      defaultProps: {
        color: "transparent",
        position: "sticky",
        elevation: 0,
      },
      styleOverrides: {
        root: {
          background: "var(--bg-linear)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
          width: "calc(100% - 80px)",
          margin: "12px auto",
          borderRadius: 999,
          paddingInline: 12,
          backdropFilter: "blur(10px)",
          top: 0,
          boxSizing: "border-box",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          position: "relative",
          borderRadius: 16,
          background: "var(--bg-card)",
          cursor: "pointer",
          overflow: "hidden",
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 14px 34px rgba(0, 0, 0, 0.14)",
          },
        },
      },
    },

    MuiContainer: {
      defaultProps: {
        maxWidth: "lg",
      },
      styleOverrides: {
        root: {
          paddingInline: 16,
          paddingBlock: 32,
        },
      },
    },
  },
});
