import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { languages } from "@/i18n/config";

// Language options
const LanguageSwitcher = () => {
  const locale = useLocale();
  const [currentLocale, setCurrentLocale] = useState(locale);
  const t = useTranslations("Common");

  // Function to change the language
  const handleLanguageChange = (localeCode : any) => {
    // Store the selected language in cookies
    document.cookie = `locale=${localeCode}; path=/; max-age=31536000`; // 1 year expiration

    // Update state
    setCurrentLocale(localeCode);

    // Reload the page to apply the new language
    window.location.reload();
  };

  // Sync locale from cookies if available
  useEffect(() => {
    const getCookie = (name :any) => {
      return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`))
        ?.split("=")[1];
    };

    const savedLocale = getCookie("locale") || locale;
    setCurrentLocale(savedLocale);
  }, [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-auto px-3 rounded-full border-none flex items-center gap-2"
        >
          <Globe className="h-[1.2rem] w-[1.2rem] text-muted-foreground transition-all hover:text-primary" />
          <span className="text-sm">{languages.find((lang) => lang.code === currentLocale)?.name}</span>
          <span className="sr-only">{t("switchLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "cursor-pointer",
              currentLocale === language.code && "bg-accent font-medium"
            )}
          >
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
