'use client';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ModeToggle } from '@/components/ModeToggle';
import { UserButton } from '@/components/user-button';
// import { useCurrentRole } from "@/hooks/use-current-role";
import { useCurrentUserClient } from '@/hooks/use-current-user';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
export default function Navbar({ children }: { children: React.ReactNode }) {
  const t = useTranslations('LandingPage');
  const user = useCurrentUserClient();

  useEffect(() => {
    console.log('ROLE: ', { user });
    document.cookie = `role=${user?.role}; path=/; max-age=86400`; // expires in 24 hours
  }, []);

  return (
    <div className="space-y-[65px]">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 z-[100] w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            onClick={() => (window.location.href = '/')}
          >
            <Image
              alt="logo"
              src="/logo/creditunify-logo.svg"
              width={35}
              height={35}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              {t('header.logo')}
            </span>
          </motion.div>
          <div className="flex space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
            <div className="flex gap-4 items-center">
              <LanguageSwitcher />
              <div className="hidden md:block lg:block">
                <ModeToggle />
              </div>
              <UserButton />
            </div>
          </div>
        </div>
      </motion.header>
      {children}
    </div>
  );
}
