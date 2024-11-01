'use client'

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChat } from "ai/react";
import { useState, useRef, useEffect } from 'react';
import RatingsChart from './RatingsChart';
import { v4 as uuidv4 } from 'uuid';



export function Chat() {
    const { messages, input, handleInputChange, handleSubmit } = useChat();
    const chatParent = useRef<HTMLUListElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [isVis, setIsVis] = useState(true);
    const [chatDone, setChatDone] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null); // Session ID state

    useEffect(() => {
        const domNode = chatParent.current;
        if (domNode) {
            domNode.scrollTop = domNode.scrollHeight;
        }
    });

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    const toggleIsVis = () => {
        setIsVis(!isVis);
    };

    // Set session ID and mark chat as done
    const handleChatComplete = () => {
        setSessionId(uuidv4()); // Generate a new session ID
        setChatDone(true);
    };

    return (
        <main className="flex flex-col w-full h-screen max-h-dvh bg-background">
            {isVisible && (
                <>
                    <h1 className="text-5xl font-bold flex items-center justify-center h-screen">PsyCurio</h1>

                    <div className="flex items-center justify-center h-screen">
                        <Button onClick={toggleVisibility} className="text-2xl py-4 px-8 rounded-lg bg-blue-500 text-white hover:bg-blue-700">
                            Start the personality test
                        </Button>
                    </div>
                </>
            )}
            {!isVisible && (
                <>
                    <header className="p-4 border-b w-full max-w-3xl mx-auto flex justify-between items-center">
                        <h1 className="text-2xl font-bold">AI Chat</h1>
                        <Button onClick={toggleIsVis} className="text-lg py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-700">
                            {isVis ? "View Personality Test" : "Show Chat"}
                        </Button>
                    </header>
                    {isVis && (
                        <>
                            <section className="p-4">
                                <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mx-auto items-center">
                                    <Input
                                        className="flex-1 min-h-[40px]"
                                        placeholder="Type your question here..."
                                        type="text"
                                        value={input}
                                        onChange={handleInputChange}
                                    />
                                    <Button className="ml-2" type="submit">
                                        Submit
                                    </Button>
                                </form>
                            </section>
                            
                            <section className="container px-0 pb-10 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
                                <ul ref={chatParent} className="h-1 p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4">
                                    {messages.map((m, index) => (
                                        m.role === 'user' ? (
                                            <li key={index} className="flex flex-row">
                                                <div className="rounded-xl p-4 bg-background shadow-md flex">
                                                    <p className="text-primary">{m.content}</p>
                                                </div>
                                            </li>
                                        ) : (
                                            <li key={index} className="flex flex-row-reverse">
                                                <div className="rounded-xl p-4 bg-background shadow-md flex w-3/4">
                                                    <p className="text-primary">
                                                        <span className="font-bold">Answer: </span>{m.content}
                                                    </p>
                                                </div>
                                            </li>
                                        )
                                    ))}
                                </ul>
                            </section>
                            <section className="p-4 flex justify-center">
                                <Button onClick={handleChatComplete} className="text-lg py-2 px-4 rounded-lg bg-green-500 text-white hover:bg-green-700">
                                    Chat Complete
                                </Button>
                            </section>
                        </>
                    )}
                </>
            )}
            {!isVis && (
                <RatingsChart />
            )}
        </main>
    );
}
