'use client';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ChevronRight,
  Database,
  Globe,
  LockKeyhole,
  MessageSquare,
  PieChart,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Star,
  Award,
  Zap,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

// Animated component that fades in when in view
const FadeInWhenVisible = ({ children, delay = 0, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Animated counter component
const AnimatedCounter = ({ targetValue, duration = 2, className = '' }) => {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const isInView = useInView(counterRef, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTime;
      let animationFrame;

      const countUp = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
        const currentCount = Math.floor(progress * targetValue);
        setCount(currentCount);
        if (progress < 1) {
          animationFrame = requestAnimationFrame(countUp);
        }
      };

      animationFrame = requestAnimationFrame(countUp);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, targetValue, duration]);

  return <div ref={counterRef} className={className}>{count}</div>;
};

export default function Home() {
  const  t  = useTranslations();
  const [activeTab, setActiveTab] = useState('user');


  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 z-[100] w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
            <Image alt="logo" src="/logo/creditunify-logo.svg" width={35} height={35} />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              {t('header.logo')}
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
              <Link href="#features" className="text-sm font-medium hover:text-primary relative group">
                {t('header.nav.features')}
                <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full" transition={{ duration: 0.3 }} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              <Link href="#howitworks" className="text-sm font-medium hover:text-primary relative group">
                {t('header.nav.howItWorks')}
                <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full" transition={{ duration: 0.3 }} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <Link href="#security" className="text-sm font-medium hover:text-primary relative group">
                {t('header.nav.security')}
                <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full" transition={{ duration: 0.3 }} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <Link href="#testimonials" className="text-sm font-medium hover:text-primary relative group">
                {t('header.nav.testimonials')}
                <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full" transition={{ duration: 0.3 }} />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <Link href="#faq" className="text-sm font-medium hover:text-primary relative group">
                {t('header.nav.faq')}
                <motion.span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full" transition={{ duration: 0.3 }} />
              </Link>
            </motion.div>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm">
                {t('header.buttons.login')}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600">
                {t('header.buttons.signup')}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/50 py-20 md:py-32">
          <motion.div
            className="absolute inset-0 bg-grid-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 1.5 }}
          />
          <div className="container relative z-10">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent py-2">
                  {t('hero.title')}
                </h1>
                <p className="text-xl text-muted-foreground">{t('hero.subtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600">
                      {t('hero.buttons.checkScore')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" variant="outline" className="gap-2">
                      {t('hero.buttons.startRisk')} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                className="relative h-[400px] rounded-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {/* Removed the dark background div */}
                {/* Removed the animated overlay div */}
                <Image
                  src="/illustration.svg"
                  alt="Illustration"
                  width={45}
                  height={45}
                  className="object-cover w-full h-full rounded-lg bg-transparent"
                />
              </motion.div>
            </div>
          </div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-primary/5"
              initial={{ x: '5%', y: '10%', scale: 0.5 }}
              animate={{ y: ['-20%', '120%'], x: ['5%', '15%', '5%'] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-primary/5"
              initial={{ x: '21%', y: '20%', scale: 0.7 }}
              animate={{ y: ['-20%', '120%'], x: ['21%', '31%', '21%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-primary/5"
              initial={{ x: '37%', y: '30%', scale: 0.6 }}
              animate={{ y: ['-20%', '120%'], x: ['37%', '47%', '37%'] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-primary/5"
              initial={{ x: '53%', y: '40%', scale: 0.8 }}
              animate={{ y: ['-20%', '120%'], x: ['53%', '63%', '53%'] }}
              transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-primary/5"
              initial={{ x: '69%', y: '50%', scale: 0.9 }}
              animate={{ y: ['-20%', '120%'], x: ['69%', '79%', '69%'] }}
              transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-16 h-16 rounded-full bg-primary/5"
              initial={{ x: '85%', y: '60%', scale: 0.5 }}
              animate={{ y: ['-20%', '120%'], x: ['85%', '95%', '85%'] }}
              transition={{ duration: 17, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-background">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FadeInWhenVisible delay={0.1}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Star className="h-8 w-8 text-yellow-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={parseInt(t('stats.satisfaction.value'))} />%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t('stats.satisfaction.label')}</p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.2}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Users className="h-8 w-8 text-blue-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={parseInt(t('stats.users.value'))} />
                      {t('stats.users.suffix')}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t('stats.users.label')}</p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.3}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <BarChart3 className="h-8 w-8 text-green-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={parseInt(t('stats.reports.value'))} />
                      {t('stats.reports.suffix')}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t('stats.reports.label')}</p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.4}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Award className="h-8 w-8 text-purple-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={parseInt(t('stats.partners.value'))} />
                      {t('stats.partners.suffix')}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{t('stats.partners.label')}</p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            </div>
          </div>
        </section>

        {/* Role Section */}
        <section className="py-20 bg-background">
          <div className="container">
            <FadeInWhenVisible>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent inline-block">
                  {t('roleSection.title')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('roleSection.subtitle')}</p>
              </div>
            </FadeInWhenVisible>

            <Tabs defaultValue="user" className="max-w-4xl mx-auto" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="user">{t('roleSection.tabs.individuals')}</TabsTrigger>
                <TabsTrigger value="bank">{t('roleSection.tabs.banks')}</TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <TabsContent value="user" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <BarChart3 className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">{t('roleSection.individuals.features.0.title')}</h3>
                              <p className="text-sm text-muted-foreground">{t('roleSection.individuals.features.0.description')}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Sparkles className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">{t('roleSection.individuals.features.1.title')}</h3>
                              <p className="text-sm text-muted-foreground">{t('roleSection.individuals.features.1.description')}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Shield className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">{t('roleSection.individuals.features.2.title')}</h3>
                              <p className="text-sm text-muted-foreground">{t('roleSection.individuals.features.2.description')}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                    <div className="flex justify-center mt-8">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600">
                          {t('roleSection.individuals.button')} <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </TabsContent>

                  <TabsContent value="bank" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <PieChart className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">{t('roleSection.banks.features.0.title')}</h3>
                              <p className="text-sm text-muted-foreground">{t('roleSection.banks.features.0.description')}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Database className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">{t('roleSection.banks.features.1.title')}</h3>
                              <p className="text-sm text-muted-foreground">{t('roleSection.banks.features.1.description')}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                      <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <TrendingUp className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">{t('roleSection.banks.features.2.title')}</h3>
                              <p className="text-sm text-muted-foreground">{t('roleSection.banks.features.2.description')}</p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                    <div className="flex justify-center mt-8">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="lg" className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600">
                          {t('roleSection.banks.button')} <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/50 relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-grid-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 1 }}
          />
          <div className="container relative z-10">
            <FadeInWhenVisible>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent inline-block">
                  {t('features.title')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('features.subtitle')}</p>
              </div>
            </FadeInWhenVisible>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              <FadeInWhenVisible delay={0.1}>
                <FeatureCard
                  icon={<BarChart3 className="h-10 w-10 text-primary" />}
                  title={t('features.items.0.title')}
                  description={t('features.items.0.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.2}>
                <FeatureCard
                  icon={<MessageSquare className="h-10 w-10 text-primary" />}
                  title={t('features.items.1.title')}
                  description={t('features.items.1.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.3}>
                <FeatureCard
                  icon={<Shield className="h-10 w-10 text-primary" />}
                  title={t('features.items.2.title')}
                  description={t('features.items.2.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.4}>
                <FeatureCard
                  icon={<Globe className="h-10 w-10 text-primary" />}
                  title={t('features.items.3.title')}
                  description={t('features.items.3.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.5}>
                <FeatureCard
                  icon={<Bell className="h-10 w-10 text-primary" />}
                  title={t('features.items.4.title')}
                  description={t('features.items.4.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.6}>
                <FeatureCard
                  icon={<Zap className="h-10 w-10 text-primary" />}
                  title={t('features.items.5.title')}
                  description={t('features.items.5.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.7}>
                <FeatureCard
                  icon={<AlertCircle className="h-10 w-10 text-primary" />}
                  title={t('features.items.6.title')}
                  description={t('features.items.6.description')}
                />
              </FadeInWhenVisible>
              <FadeInWhenVisible delay={0.8}>
                <FeatureCard
                  icon={<TrendingUp className="h-10 w-10 text-primary" />}
                  title={t('features.items.7.title')}
                  description={t('features.items.7.description')}
                />
              </FadeInWhenVisible>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-background">
          <div className="container">
            <FadeInWhenVisible>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent inline-block">
                  {t('howItWorks.title')}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
              </div>
            </FadeInWhenVisible>
            <Tabs defaultValue="user-flow" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="user-flow">{t('howItWorks.tabs.individuals')}</TabsTrigger>
                <TabsTrigger value="bank-flow">{t('howItWorks.tabs.banks')}</TabsTrigger>
              </TabsList>
              <TabsContent value="user-flow">
                <div className="grid gap-8 md:grid-cols-3">
                  <FadeInWhenVisible delay={0.2}>
                    <StepCard
                      number={t('howItWorks.individuals.steps.0.number')}
                      title={t('howItWorks.individuals.steps.0.title')}
                      description={t('howItWorks.individuals.steps.0.description')}
                    />
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.4}>
                    <StepCard
                      number={t('howItWorks.individuals.steps.1.number')}
                      title={t('howItWorks.individuals.steps.1.title')}
                      description={t('howItWorks.individuals.steps.1.description')}
                    />
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.6}>
                    <StepCard
                      number={t('howItWorks.individuals.steps.2.number')}
                      title={t('howItWorks.individuals.steps.2.title')}
                      description={t('howItWorks.individuals.steps.2.description')}
                    />
                  </FadeInWhenVisible>
                </div>
              </TabsContent>
              <TabsContent value="bank-flow">
                <div className="grid gap-8 md:grid-cols-3">
                  <FadeInWhenVisible delay={0.2}>
                    <StepCard
                      number={t('howItWorks.banks.steps.0.number')}
                      title={t('howItWorks.banks.steps.0.title')}
                      description={t('howItWorks.banks.steps.0.description')}
                    />
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.4}>
                    <StepCard
                      number={t('howItWorks.banks.steps.1.number')}
                      title={t('howItWorks.banks.steps.1.title')}
                      description={t('howItWorks.banks.steps.1.description')}
                    />
                  </FadeInWhenVisible>
                  <FadeInWhenVisible delay={0.6}>
                    <StepCard
                      number={t('howItWorks.banks.steps.2.number')}
                      title={t('howItWorks.banks.steps.2.title')}
                      description={t('howItWorks.banks.steps.2.description')}
                    />
                  </FadeInWhenVisible>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Dashboard Previews */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('dashboardPreviews.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t('dashboardPreviews.subtitle')}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                  <img src="/placeholder.svg?height=300&width=600" alt="User Dashboard Preview" className="object-cover w-full h-full" />
                </div>
                <h3 className="text-xl font-medium text-center">{t('dashboardPreviews.user.title')}</h3>
                <p className="text-center text-muted-foreground">{t('dashboardPreviews.user.description')}</p>
              </div>
              <div className="space-y-4">
                <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                  <img src="/placeholder.svg?height=300&width=600" alt="Bank Dashboard Preview" className="object-cover w-full h-full" />
                </div>
                <h3 className="text-xl font-medium text-center">{t('dashboardPreviews.bank.title')}</h3>
                <p className="text-center text-muted-foreground">{t('dashboardPreviews.bank.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('security.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t('security.subtitle')}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <SecurityCard
                icon={<LockKeyhole className="h-8 w-8 text-primary" />}
                title={t('security.features.0.title')}
                description={t('security.features.0.description')}
              />
              <SecurityCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title={t('security.features.1.title')}
                description={t('security.features.1.description')}
              />
              <SecurityCard
                icon={<CheckCircle className="h-8 w-8 text-primary" />}
                title={t('security.features.2.title')}
                description={t('security.features.2.description')}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('testimonials.title')}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t('testimonials.subtitle')}</p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <TestimonialCard
                quote={t('testimonials.items.0.quote')}
                author={t('testimonials.items.0.author')}
                role={t('testimonials.items.0.role')}
              />
              <TestimonialCard
                quote={t('testimonials.items.1.quote')}
                author={t('testimonials.items.1.author')}
                role={t('testimonials.items.1.role')}
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">{t('cta.title')}</h2>
              <p className="text-xl opacity-90">{t('cta.subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="gap-2">
                  {t('cta.buttons.checkScore')} <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 bg-transparent border-primary-foreground hover:bg-primary-foreground/10">
                  {t('cta.buttons.startAnalysis')} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">{t('header.logo')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{t('footer.description')}</p>
            </div>
            <div>
              <h3 className="font-medium mb-4">{t('footer.product.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.product.links.0')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.product.links.1')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.product.links.2')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.product.links.3')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">{t('footer.resources.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.resources.links.0')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.resources.links.1')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.resources.links.2')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.resources.links.3')}</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">{t('footer.company.title')}</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.company.links.0')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.company.links.1')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.company.links.2')}</Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">{t('footer.company.links.3')}</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Sub-components remain unchanged structurally, just passing props
function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6 h-full flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, title, description }) {
  return (
    <Card className="h-full relative">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
        {number}
      </div>
      <CardContent className="pt-8 h-full flex flex-col items-center text-center">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function SecurityCard({ icon, title, description }) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6 h-full flex flex-col items-center text-center">
        <div className="mb-4">{icon}</div>
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, author, role }) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6 h-full flex flex-col">
        <div className="mb-4 text-4xl text-primary">"</div>
        <p className="text-muted-foreground mb-4 flex-1">{quote}</p>
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </CardContent>
    </Card>
  );
}