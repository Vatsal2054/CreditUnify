'use client';

import { useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const NextIntlClientProviderwrapper = ({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: any;
}) => {
  const [locale, setLocale] = useState('en');

  // Load stored locale from localStorage on client side
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale');
    console.log('savedLocale', savedLocale);
    if (savedLocale && messages[savedLocale]) {
      setLocale(savedLocale);
    }
  }, []);

  return (
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
};
