'use client';
import { useState, useEffect, useRef } from 'react';
import type React from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, User, Bot, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { processPrompt } from './action';
import { readStreamableValue } from 'ai/rsc';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCurrentUserClient } from '@/hooks/use-current-user';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIInsight() {
  const [userInput, setUserInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello, I am your **AI-powered financial advisor**. How can I help you today?',
    },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const user = useCurrentUserClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (userInput.trim()) {
      setIsLoading(true);
      setOpen(true);
      setError(null);

      const userMessage = userInput.trim();
      setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
      setUserInput('');

      try {
        const output = await processPrompt(userMessage);
        let assistantMessage = '';

        for await (const delta of readStreamableValue(output as any)) {
          assistantMessage += delta;
          setMessages((prev) => {
            const newMessages = [...prev];
            if (newMessages[newMessages.length - 1].role === 'assistant') {
              newMessages[newMessages.length - 1].content = assistantMessage;
            } else {
              newMessages.push({
                role: 'assistant',
                content: assistantMessage,
              });
            }
            return newMessages;
          });
        }
      } catch (err) {
        console.error('Error processing prompt:', err);
        setError('An error occurred while generating a response.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button
                className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full border border-dotted border-zinc-700 p-0 shadow-lg transition-shadow duration-300 hover:shadow-xl sm:h-14 sm:w-14 md:h-16 md:w-16"
                variant="outline"
                aria-label="Open Financial AI Insight"
              >
                <div className="w-full h-full flex justify-center items-center scale-[1.8]">
                  <MessageCircle />
                </div>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get AI-powered financial insights</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="flex h-[90vh] max-h-[90vh] w-[95vw] flex-col gap-0 bg-background p-0 text-foreground sm:h-[80vh] sm:max-h-[80vh] sm:w-[90vw]">
        <DialogHeader className="p-4 sm:p-6">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Financial AI Insight
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow px-4 pb-4 sm:px-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-[90%] items-start gap-2 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  } sm:max-w-[85%]`}
                >
                  <Avatar className="mt-1 h-8 w-8 sm:h-10 sm:w-10">
                    {message.role === 'user' ? (
                      //@ts-ignore
                      <>
                        <AvatarImage src={user?.image || ''} alt="User" />
                        <AvatarFallback>
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      </>
                    ) : (
                      <>
                        <AvatarFallback>
                          <Bot className="h-4 w-4 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div
                    className={`rounded-lg p-2 sm:p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } overflow-x-auto`}
                  >
                    {message.role === 'assistant' ? (
                      <div className='prose'>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => (
                            <h1
                              {...props}
                              className="mb-4 border-b-2 border-blue-500 pb-2 text-2xl font-bold text-blue-600 dark:border-blue-700 dark:text-blue-400"
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              {...props}
                              className="mb-3 mt-5 border-l-4 border-blue-500 pl-2 text-xl font-semibold text-blue-600 dark:border-blue-700 dark:text-blue-400"
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3
                              {...props}
                              className="mb-2 text-lg font-semibold text-blue-600 dark:text-blue-400"
                            />
                          ),
                          p: ({ node, ...props }) => (
                            <p
                              {...props}
                              className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200"
                            />
                          ),
                          ul: ({ node, ...props }) => (
                            <ul
                              {...props}
                              className="mb-4 list-disc pl-5 [&>li]:mb-2"
                            />
                          ),
                          ol: ({ node, ...props }) => (
                            <ol
                              {...props}
                              className="mb-4 list-decimal pl-5 [&>li]:mb-2"
                            />
                          ),
                          li: ({ node, ...props }) => (
                            <li
                              {...props}
                              className="text-gray-800 dark:text-gray-200"
                            />
                          ),
                          strong: ({ node, ...props }) => (
                            <strong
                              {...props}
                              className="font-semibold text-gray-900 dark:text-gray-100"
                            />
                          ),
                          em: ({ node, ...props }) => (
                            <em
                              {...props}
                              className="font-semibold italic text-blue-600 dark:text-blue-400"
                            />
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              {...props}
                              className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:blue-green-700 dark:text-gray-400"
                            />
                          ),
                          code: ({ node, ...props }) => (
                            <code
                              {...props}
                              className="block overflow-x-auto rounded-lg bg-gray-100 p-3 font-mono text-sm text-blue-600 dark:bg-gray-800 dark:text-blue-400"
                            />
                          ),
                          table: ({ node, ...props }) => (
                            <div className="overflow-x-auto">
                              <table
                                {...props}
                                className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                              />
                            </div>
                          ),
                          thead: ({ node, ...props }) => (
                            <thead
                              {...props}
                              className="bg-gray-50 dark:bg-gray-800"
                            />
                          ),
                          tbody: ({ node, ...props }) => (
                            <tbody
                              {...props}
                              className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900"
                            />
                          ),
                          tr: ({ node, ...props }) => (
                            <tr
                              {...props}
                              className="hover:bg-gray-50 dark:hover:bg-gray-800"
                            />
                          ),
                          th: ({ node, ...props }) => (
                            <th
                              {...props}
                              className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                            />
                          ),
                          td: ({ node, ...props }) => (
                            <td
                              {...props}
                              className="whitespace-nowrap px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                            />
                          ),
                          div: ({ node, ...props }) => (
                            <div {...props} className="my-0" />
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm sm:text-base">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="border-t p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask me about your finances..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !userInput.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <p className="text-sm">{error}</p>
              </div>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
