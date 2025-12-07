"use client";

import { useState, useCallback, ChangeEvent } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface FAQItem {
  q: string;
  a: string;
}
type PanelKey = string | false;

const items = [
    {
      q: "מה זה GrouPay?",
      a: "GrouPay היא פלטפורמה לניהול הוצאות משותפות וחובות בין קבוצות חברים, שותפים, משפחה או מטיילים. אנחנו מפשטים את תהליך חישוב התשלומים ומבטיחים שכל אחד משלם את חלקו המדויק.",
    },
    {
      q: "למי מיועדת GrouPay?",
      a: "לכל מי שמשתף הוצאות, כולל שותפים לדירה (שכר דירה, חשבונות), חברים (בילויים, מתנות משותפות), זוגות וקבוצות טיולים.",
    },
    {
      q: "האם GrouPay בטוחה לשימוש?",
      a: "כן, אנחנו מקפידים על אבטחת מידע. חשוב לזכור: GrouPay היא כלי לחישוב חובות בלבד, והיא אינה מעבירה כסף בפועל. התשלום מתבצע מחוץ לאפליקציה (ב-Bit, PayBox וכדומה).",
    },

    {
      q: "איך האפליקציה מחשבת מי חייב למי?",
      a: "האלגוריתם של GrouPay מבצע אופטימיזציה של החובות. המערכת מזהה את מינימום ההעברות הנדרשות כדי לסגור את הפינה, מה שמפשט את תהליך התשלום.",
    },

    {
      q: "מה היתרון של GrouPay על פני אקסל או רשימה בכתב?",
      a: "GrouPay מונעת טעויות אנוש, מספקת שקיפות מיידית לכל חברי הקבוצה, ומבצעת חישובים מורכבים בצורה אוטומטית.",
    },
    {
      q: "מה הפתרון שלכם למקרה שבו מישהו לא משלם את חובו?",
      a: "GrouPay אינה מנגנון גבייה, אלא כלי חישוב וניהול. אנחנו מספקים תזכורות ידידותיות ודוחות ברורים, אך האחריות לתשלום בפועל נשארת בין חברי הקבוצה.",
    },
    {
      q: "האם השימוש ב-GrouPay כרוך בתשלום?",
      a: "השימוש הבסיסי ב-GrouPay לניהול חובות הוא חינמי לחלוטין. בעתיד אנו עשויים להציע תכונות פרימיום מתקדמות, אך כרגע כל השירותים פתוחים לשימוש.",
    },
  ];

export default function FAQPage() {
  const [expanded, setExpanded] = useState<PanelKey>(false);

  const handleChange = useCallback(
    (panel: string) => (_event: ChangeEvent<{}>, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    },
    []
  );

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 10, direction: "rtl" }}>
      <Typography
        variant="h4"
        fontWeight={800}
        textAlign="center"
        color="primary"
        mb={4}
      >
        שאלות נפוצות
      </Typography>

      {items.map(({ q, a }, i) => {
        const panelId = `panel${i}`;
        return (
          <Accordion
            key={i}
            expanded={expanded === panelId}
            onChange={handleChange(panelId)}
            sx={{
              borderRadius: "14px !important",
              mb: 2,
              boxShadow: "0 6px 18px rgba(0,0,0,0.07)",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700}>{q}</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography color="text.secondary" lineHeight={1.7}>
                {a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Container>
  );
}