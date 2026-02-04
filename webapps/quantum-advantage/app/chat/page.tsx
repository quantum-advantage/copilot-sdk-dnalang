"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { ChatProvider, useChat } from "@/lib/chat/chat-context"
import { MessageBubble } from "@/components/chat/message-bubble"
import { MessageInput } from "@/components/chat/message-input"
import { SessionList } from "@/components/chat/session-list"
import { EmptyState } from "@/components/chat/empty-state"
import { ScrollArea } from "@/components/ui/scroll-area"

function ChatPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { sessions, currentSession, isLoading, createNewSession, selectSession, sendMessage, deleteSession } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      router.push("/auth/signin?callbackUrl=/chat")
    }
  }, [user, isLoading, router])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [currentSession?.messages])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-200 hidden md:block">
        <SessionList
          sessions={sessions}
          currentSessionId={currentSession?.id || null}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {currentSession ? (
          <>
            {/* Chat header */}
            <div className="border-b border-gray-200 p-4">
              <h2 className="font-semibold truncate">{currentSession.title}</h2>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {currentSession.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-gray-200 p-4">
              <MessageInput onSendMessage={sendMessage} />
            </div>
          </>
        ) : (
          <EmptyState onNewChat={createNewSession} />
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <ChatProvider>
      <ChatPageContent />
    </ChatProvider>
  )
}
