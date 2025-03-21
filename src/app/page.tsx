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
  Phone,
  Mail,
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
import { useRouter } from 'next/navigation';

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
        const progress = Math.min(
          (timestamp - startTime) / (duration * 1000),
          1,
        );
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

  return (
    <div ref={counterRef} className={className}>
      {count}
    </div>
  );
};

export default function Home() {
  const router=useRouter();
  const [activeTab, setActiveTab] = useState('user');

  return (
    <div className="flex min-h-screen flex-col">
      {/* Enhanced header with animation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="fixed top-0 z-[100] w-full border-b bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60"
      >
        <div className="container flex h-16 items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            <Image 
              alt='logo'
              src={"/logo/creditunify-logo.svg"}
              width={35}
              height={35}
            />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              CreditUnify
            </span>
          </motion.div>
          <nav className="hidden md:flex items-center gap-6">
            {[
              'Features',
              'How It Works',
              'Security',
              'Testimonials',
              'FAQ',
            ].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium hover:text-primary relative group"
                >
                  {item}
                  <motion.span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full"
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" size="sm">
                Log In
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
              >
                Sign Up
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      <main className="flex-1 pt-16">
        {/* Enhanced Hero Section with Animations */}
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
                  One Score, Complete Clarity – Unified Credit Insights
                </h1>
                <p className="text-xl text-muted-foreground">
                  Empowering individuals with multi-bureau credit insights &
                  helping banks make smarter lending decisions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
                    >
                      Check Your Score <ArrowRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button size="lg" variant="outline" className="gap-2">
                      Start Risk Assessment <ArrowRight className="h-4 w-4" />
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
                  src="/Untitled.svg"
                  alt="Illustration"
                  width={45}
                  height={45}
                  className="object-cover w-full h-full rounded-lg"
                />
              </motion.div>
            </div>
          </div>

          {/* Floating elements animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-16 h-16 rounded-full bg-primary/5"
                initial={{
                  x: Math.random() * 100 - 50 + '%',
                  y: Math.random() * 100 + '%',
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  y: ['-20%', '120%'],
                  x: [
                    Math.random() * 20 - 10 + '%',
                    Math.random() * 20 - 10 + '%',
                    Math.random() * 20 - 10 + '%',
                  ],
                }}
                transition={{
                  duration: 10 + Math.random() * 20,
                  repeat: Infinity,
                  ease: 'linear',
                  times: [0, 1],
                }}
                style={{ left: `${i * 16 + 5}%` }}
              />
            ))}
          </div>
        </section>

        {/* Stats Section - New Addition */}
        <section className="py-12 bg-background">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FadeInWhenVisible delay={0.1}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Star className="h-8 w-8 text-yellow-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={90} />%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Customer Satisfaction
                    </p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.2}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Users className="h-8 w-8 text-blue-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={200} />
                      K+
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Active Users
                    </p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.3}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <BarChart3 className="h-8 w-8 text-green-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={15} />
                      M+
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Credit Reports Generated
                    </p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>

              <FadeInWhenVisible delay={0.4}>
                <Card className="h-full border-primary/20 hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6 flex flex-col items-center text-center">
                    <Award className="h-8 w-8 text-purple-500 mb-3" />
                    <div className="text-3xl font-bold text-primary">
                      <AnimatedCounter targetValue={50} />+
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Banking Partners
                    </p>
                  </CardContent>
                </Card>
              </FadeInWhenVisible>
            </div>
          </div>
        </section>

        {/* Choose Your Role Section with Enhanced Animations */}
        <section className="py-20 bg-background">
          <div className="container">
            <FadeInWhenVisible>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent inline-block">
                  Choose Your Role
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Whether you're an individual looking to improve your credit
                  score or a bank making lending decisions, CreditUnify has the
                  tools you need.
                </p>
              </div>
            </FadeInWhenVisible>

            <Tabs
              defaultValue="user"
              className="max-w-4xl mx-auto"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="user">For Individuals</TabsTrigger>
                <TabsTrigger value="bank">For Banks</TabsTrigger>
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
                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <BarChart3 className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">
                                Multi-Bureau Scores
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Check credit scores from multiple bureaus in one
                                place
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Sparkles className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">
                                AI-Driven Suggestions
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Get personalized tips to improve your credit
                                score
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Shield className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">Fraud Alerts</h3>
                              <p className="text-sm text-muted-foreground">
                                Receive instant alerts for suspicious activities
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    <div className="flex justify-center mt-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
                        >
                          Get My Score <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </TabsContent>

                  <TabsContent value="bank" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <PieChart className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">Risk Assessment</h3>
                              <p className="text-sm text-muted-foreground">
                                Access real-time credit risk assessment tools
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <Database className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">Borrower Insights</h3>
                              <p className="text-sm text-muted-foreground">
                                View comprehensive loan history and borrower
                                patterns
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <Card className="h-full border-primary/20 hover:border-primary/70 hover:shadow-md transition-all">
                          <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center space-y-3">
                              <TrendingUp className="h-8 w-8 text-primary" />
                              <h3 className="font-medium">
                                Default Predictions
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                AI-driven loan default predictions and analytics
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    <div className="flex justify-center mt-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          size="lg"
                          className="gap-2 bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600"
                        >
                          Start Lending Assessment{' '}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </section>

        {/* Key Features Section with Enhanced Animations */}
        <section
          id="features"
          className="py-20 bg-muted/50 relative overflow-hidden"
        >
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
                  Key Features
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Powerful tools for both individuals and financial institutions
                </p>
              </div>
            </FadeInWhenVisible>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: <BarChart3 className="h-10 w-10 text-primary" />,
                  title: 'Multi-Bureau Aggregation',
                  description:
                    'Combine scores from CIBIL, Experian, Equifax, CRIF and more for a complete picture',
                },
                {
                  icon: <MessageSquare className="h-10 w-10 text-primary" />,
                  title: 'AI-Powered Chatbot',
                  description:
                    'Get instant answers to credit questions and personalized advice',
                },
                {
                  icon: <Shield className="h-10 w-10 text-primary" />,
                  title: 'Real-Time Risk Assessment',
                  description:
                    'Advanced algorithms to detect fraud and assess lending risk',
                },
                {
                  icon: <Globe className="h-10 w-10 text-primary" />,
                  title: 'Multi-Language Support',
                  description:
                    'Access credit insights in your preferred language',
                },
                {
                  icon: <Bell className="h-10 w-10 text-primary" />,
                  title: 'Credit Alert System',
                  description:
                    'Get notified of important changes to your credit report in real-time',
                },
                {
                  icon: <Zap className="h-10 w-10 text-primary" />,
                  title: 'Score Optimizer',
                  description:
                    'AI algorithms suggest the fastest path to improving your score',
                },
                {
                  icon: <AlertCircle className="h-10 w-10 text-primary" />,
                  title: 'Dispute Management',
                  description:
                    'Easily identify and resolve credit report errors across all bureaus',
                },
                {
                  icon: <TrendingUp className="h-10 w-10 text-primary" />,
                  title: 'Score Prediction',
                  description:
                    'Forecast how financial decisions will impact your future credit score',
                },
              ].map((feature, index) => (
                <FadeInWhenVisible key={feature.title} delay={0.1 * index}>
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                  />
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section with Enhanced Animations */}
        <section id="how-it-works" className="py-20 bg-background">
          <div className="container">
            <FadeInWhenVisible>
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent inline-block">
                  How It Works
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Simple steps to get started with CreditUnify
                </p>
              </div>
            </FadeInWhenVisible>

            <Tabs defaultValue="user-flow" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="user-flow">For Individuals</TabsTrigger>
                <TabsTrigger value="bank-flow">For Banks</TabsTrigger>
              </TabsList>

              <TabsContent value="user-flow">
                <div className="grid gap-8 md:grid-cols-3">
                  {[
                    {
                      number: '1',
                      title: 'Sign Up & Verify Identity',
                      description:
                        'Create an account and complete the secure verification process',
                    },
                    {
                      number: '2',
                      title: 'Link Credit Bureaus',
                      description:
                        'Connect to multiple credit bureaus to get your unified score',
                    },
                    {
                      number: '3',
                      title: 'Improve with AI Suggestions',
                      description:
                        'Follow personalized recommendations to boost your score',
                    },
                  ].map((step, index) => (
                    <FadeInWhenVisible key={step.number} delay={index * 0.2}>
                      <StepCard
                        number={step.number}
                        title={step.title}
                        description={step.description}
                      />
                    </FadeInWhenVisible>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="bank-flow">
                <div className="grid gap-8 md:grid-cols-3">
                  {[
                    {
                      number: '1',
                      title: 'Sign Up & Access Dashboard',
                      description:
                        'Create a bank account and access your dedicated dashboard',
                    },
                    {
                      number: '2',
                      title: 'Search Borrower Profiles',
                      description:
                        'Look up comprehensive credit profiles for any borrower',
                    },
                    {
                      number: '3',
                      title: 'Analyze Risks & Decide',
                      description:
                        'Use AI-powered insights to make informed lending decisions',
                    },
                  ].map((step, index) => (
                    <FadeInWhenVisible key={step.number} delay={index * 0.2}>
                      <StepCard
                        number={step.number}
                        title={step.title}
                        description={step.description}
                      />
                    </FadeInWhenVisible>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Dashboard Previews */}
        <section className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Dashboard Previews</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Intuitive interfaces designed for both individuals and banks
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="/placeholder.svg?height=300&width=600"
                    alt="User Dashboard Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-medium text-center">
                  User Dashboard
                </h3>
                <p className="text-center text-muted-foreground">
                  Track your credit score, view improvement tips, and monitor
                  your progress
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
                  <img
                    src="/placeholder.svg?height=300&width=600"
                    alt="Bank Dashboard Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
                <h3 className="text-xl font-medium text-center">
                  Bank Dashboard
                </h3>
                <p className="text-center text-muted-foreground">
                  Analyze borrower profiles, assess risks, and make data-driven
                  lending decisions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Compliance */}
        <section id="security" className="py-20 bg-background">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Security & Compliance</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your data security is our top priority
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              <SecurityCard
                icon={<LockKeyhole className="h-8 w-8 text-primary" />}
                title="End-to-End Encryption"
                description="All your data is encrypted in transit and at rest"
              />
              <SecurityCard
                icon={<Users className="h-8 w-8 text-primary" />}
                title="Trusted by Institutions"
                description="Used by leading banks and financial organizations"
              />
              <SecurityCard
                icon={<CheckCircle className="h-8 w-8 text-primary" />}
                title="Regulatory Compliance"
                description="Compliant with global credit regulations and standards"
              />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-muted/50">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Testimonials</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                See what our users and partners have to say
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <TestimonialCard
                quote="CreditUnify helped me track my credit score across bureaus and improve it by 85 points in just 3 months!"
                author="Rahul M."
                role="Individual User"
              />
              <TestimonialCard
                quote="Our lending decisions are now 40% faster and more accurate with CreditUnify's comprehensive risk assessment tools."
                author="Priya S."
                role="Credit Manager, ABC Bank"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
              <p className="text-xl opacity-90">
                Choose your role and sign up today to access unified credit
                insights
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="gap-2">
                  Check My Credit Score <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-transparent border-primary-foreground hover:bg-primary-foreground/10"
                >
                  Start Risk Analysis <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12 bg-background">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">CreditUnify</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Unified credit insights for individuals and financial
                institutions.
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    API
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} CreditUnify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

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
